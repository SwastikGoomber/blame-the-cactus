import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Game Configuration
const CONFIG = {
  source: {
    basePerCactus: 5,
    multiplier: 1
  },
  tps: {
    maxTPS: 20,
    tpsDecayRate: 0.05
  },
  world: {
    width: 4000,
    viewportWidth: 1200,
    farmingAreaStart: 200,
    farmingAreaEnd: 3800,
    blockSize: 80, // Size of each farming block
    groundLevel: 400 // Y position of ground level
  },
  inventory: {
    hotbarSize: 5,
    maxItems: 20
  },
  items: {
    seeds: [
      { id: 'cactus_seed', name: 'Cactus Seed', cost: 5, icon: '🌰' }
    ],
    wands: [
      { id: 'wooden_wand', name: 'Wooden Wand', cost: 0, growthPower: 1, aoe: 0, icon: '🪄' },
      { id: 'oak_wand', name: 'Oak Wand', cost: 50, growthPower: 2, aoe: 1, icon: '✨' },
      { id: 'silverwood_wand', name: 'Silverwood Wand', cost: 200, growthPower: 4, aoe: 2, icon: '🔮' },
      { id: 'thaumcraft_focus', name: 'Thaumcraft Focus', cost: 500, growthPower: 6, aoe: 3, icon: '⚡' }
    ],
    hoes: [
      { id: 'wooden_hoe', name: 'Wooden Hoe', cost: 0, harvestPower: 1, aoe: 0, icon: '🔧' },
      { id: 'iron_hoe', name: 'Iron Hoe', cost: 75, harvestPower: 2, aoe: 1, icon: '⚒️' },
      { id: 'mattock', name: 'Mattock', cost: 300, harvestPower: 4, aoe: 2, icon: '🛠️' },
      { id: 'kama', name: 'Kama', cost: 800, harvestPower: 6, aoe: 3, icon: '⚔️' }
    ]
  },
  farmTypes: [
    {
      id: 'vanilla_basic',
      name: 'Basic Cactus Farm',
      cost: 100,
      description: 'Simple vanilla Minecraft cactus farm',
      production: 1,
      minigame: 'mod_approval',
      size: { width: 2, height: 1 }, // Width in blocks, height always 1 for single row
      icon: '🏠'
    },
    {
      id: 'vanilla_advanced',
      name: 'Piston Cactus Farm',
      cost: 500,
      description: 'Automated piston-based harvester',
      production: 5,
      minigame: 'cactus_lottery',
      size: { width: 3, height: 1 },
      icon: '🏭'
    },
    {
      id: 'mystical_agriculture',
      name: 'Mystical Agriculture Plot',
      cost: 1000,
      description: 'Magical essence-infused growing',
      production: 10,
      minigame: 'count_cactus',
      size: { width: 3, height: 1 },
      icon: '🔯'
    },
    {
      id: 'industrial_foregoing',
      name: 'Plant Gatherer',
      cost: 2000,
      description: 'High-tech automated harvesting',
      production: 20,
      minigame: 'tech_calibration',
      size: { width: 4, height: 1 },
      icon: '⚙️'
    },
    {
      id: 'stardew_greenhouse',
      name: 'Stardew Greenhouse',
      cost: 3000,
      description: 'Year-round magical growing',
      production: 30,
      minigame: 'sprinkler_puzzle',
      size: { width: 5, height: 1 },
      icon: '🏛️'
    }
  ],
  players: [
    { name: "BlockMaster2024", avatar: "🧱" },
    { name: "RedstoneWizard", avatar: "⚡" },
    { name: "CactusSkeptic", avatar: "🤨" },
    { name: "BuildCrafter", avatar: "🔨" }
  ],
  mods: [
    { name: "Admin_Sarah", avatar: "👮‍♀️", personality: "strict" },
    { name: "Mod_Jackson", avatar: "🛡️", personality: "suspicious" }
  ]
};

function App() {
  // Game State
  const [source, setSource] = useState(100);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tps, setTPS] = useState(20);
  const [totalCactiHarvested, setTotalCactiHarvested] = useState(0);
  const [blameCount, setBlameCount] = useState(0);
  
  // Inventory System - Initialize with starting items in hotbar
  const [inventory, setInventory] = useState([]);
  const [hotbar, setHotbar] = useState(() => {
    const initialHotbar = Array(CONFIG.inventory.hotbarSize).fill(null);
    initialHotbar[0] = { ...CONFIG.items.seeds[0], quantity: 10 }; // Seeds in slot 0
    initialHotbar[1] = { ...CONFIG.items.wands[0], quantity: 1 }; // Wooden wand in slot 1
    initialHotbar[2] = { ...CONFIG.items.hoes[0], quantity: 1 }; // Wooden hoe in slot 2
    return initialHotbar;
  });
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  
  // World State - Single horizontal row like Terraria
  const [farmingBlocks, setFarmingBlocks] = useState(() => {
    const blocks = {};
    const startBlock = Math.floor(CONFIG.world.farmingAreaStart / CONFIG.world.blockSize);
    const endBlock = Math.floor(CONFIG.world.farmingAreaEnd / CONFIG.world.blockSize);
    
    // Single horizontal row at ground level
    for (let x = startBlock; x < endBlock; x++) {
      blocks[x] = {
        x,
        occupied: false,
        crop: null,
        farm: null
      };
    }
    return blocks;
  });
  
  const [autoFarms, setAutoFarms] = useState([]);
  const [manualCrops, setManualCrops] = useState([]);
  
  // UI State
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [npcAnimation, setNpcAnimation] = useState(null);
  const [placingFarm, setPlacingFarm] = useState(null);
  
  // Refs
  const gameWorldRef = useRef(null);
  const keysRef = useRef({});

  // Notification system
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      
      // Number keys for hotbar selection
      if (e.key >= '1' && e.key <= '5') {
        setSelectedHotbarSlot(parseInt(e.key) - 1);
      }
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const scrollInterval = setInterval(() => {
      const scrollSpeed = 10;
      if (keysRef.current['ArrowLeft']) {
        setScrollPosition(prev => Math.max(0, prev - scrollSpeed));
      }
      if (keysRef.current['ArrowRight']) {
        setScrollPosition(prev => Math.min(CONFIG.world.width - CONFIG.world.viewportWidth, prev + scrollSpeed));
      }
    }, 16);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(scrollInterval);
    };
  }, []);

  // Get block coordinate from world X position
  const getBlockX = (worldX) => {
    return Math.floor(worldX / CONFIG.world.blockSize);
  };

  // Get world X position from block coordinate
  const getWorldX = (blockX) => {
    return blockX * CONFIG.world.blockSize;
  };

  // Handle world click for farming
  const handleWorldClick = (event) => {
    const rect = gameWorldRef.current.getBoundingClientRect();
    const worldX = event.clientX - rect.left + scrollPosition;
    const worldY = event.clientY - rect.top;
    
    // Check if clicking near ground level
    if (Math.abs(worldY - CONFIG.world.groundLevel) > CONFIG.world.blockSize) {
      return; // Not clicking on farming area
    }
    
    // Check if in farming area
    if (worldX < CONFIG.world.farmingAreaStart || worldX > CONFIG.world.farmingAreaEnd) {
      addNotification("⚠️ You can only farm in designated areas!", 'warning', 2000);
      return;
    }
    
    const blockX = getBlockX(worldX);
    const block = farmingBlocks[blockX];
    
    if (!block) return;
    
    const selectedItem = hotbar[selectedHotbarSlot];
    if (!selectedItem) return;
    
    if (selectedItem.id === 'cactus_seed' && !block.occupied) {
      // Plant seed
      const newCrop = {
        id: Date.now(),
        blockX: blockX,
        growth: 0,
        maxGrowth: 100,
        type: 'cactus'
      };
      
      setManualCrops(prev => [...prev, newCrop]);
      setFarmingBlocks(prev => ({
        ...prev,
        [blockX]: { ...block, occupied: true, crop: newCrop.id }
      }));
      
      // Use seed
      setHotbar(prev => {
        const newHotbar = [...prev];
        if (newHotbar[selectedHotbarSlot].quantity > 1) {
          newHotbar[selectedHotbarSlot] = {
            ...newHotbar[selectedHotbarSlot],
            quantity: newHotbar[selectedHotbarSlot].quantity - 1
          };
        } else {
          newHotbar[selectedHotbarSlot] = null;
        }
        return newHotbar;
      });
      
      addNotification("🌱 Cactus planted!", 'plant', 1500);
    } else if (selectedItem.growthPower && block.crop) {
      // Use wand to grow
      const crop = manualCrops.find(c => c.id === block.crop);
      if (crop && crop.growth < 100) {
        const growthIncrease = selectedItem.growthPower * 15;
        setManualCrops(prev => prev.map(c => 
          c.id === crop.id 
            ? { ...c, growth: Math.min(100, c.growth + growthIncrease) }
            : c
        ));
        addNotification(`+${growthIncrease}% growth`, 'growth', 1000);
      }
    } else if (selectedItem.harvestPower && block.crop) {
      // Use hoe to harvest
      const crop = manualCrops.find(c => c.id === block.crop);
      if (crop && crop.growth >= 100) {
        const sourceGained = CONFIG.source.basePerCactus * selectedItem.harvestPower;
        setSource(prev => prev + sourceGained);
        setTotalCactiHarvested(prev => prev + 1);
        
        // Remove crop
        setManualCrops(prev => prev.filter(c => c.id !== crop.id));
        setFarmingBlocks(prev => ({
          ...prev,
          [blockX]: { ...block, occupied: false, crop: null }
        }));
        
        addNotification(`+${sourceGained} Source`, 'source', 1500);
      }
    }
  };

  // Auto farm production
  useEffect(() => {
    const interval = setInterval(() => {
      autoFarms.forEach(farm => {
        const farmType = CONFIG.farmTypes.find(ft => ft.id === farm.type);
        const production = farmType.production * (farm.upgrades?.multiplier || 1);
        setSource(prev => prev + production);
        setTotalCactiHarvested(prev => prev + production);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoFarms]);

  // Purchase item
  const purchaseItem = (item) => {
    if (source >= item.cost) {
      setSource(prev => prev - item.cost);
      setInventory(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          return [...prev, { ...item, quantity: 1 }];
        }
      });
      addNotification(`Purchased ${item.name}!`, 'purchase', 2000);
    }
  };

  // Fixed Drag and drop system
  const handleDragStart = (e, item, sourceType, sourceIndex = null) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
    setDragSource({ type: sourceType, index: sourceIndex });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetType, targetIndex = null) => {
    e.preventDefault();
    
    if (!draggedItem || !dragSource) return;
    
    if (targetType === 'hotbar' && targetIndex !== null) {
      const currentHotbarItem = hotbar[targetIndex];
      
      if (dragSource.type === 'inventory') {
        // Moving from inventory to hotbar
        setHotbar(prev => {
          const newHotbar = [...prev];
          
          // If hotbar slot has item, move it to inventory
          if (currentHotbarItem) {
            setInventory(prevInv => {
              const existing = prevInv.find(i => i.id === currentHotbarItem.id);
              if (existing) {
                return prevInv.map(i => 
                  i.id === currentHotbarItem.id 
                    ? { ...i, quantity: i.quantity + currentHotbarItem.quantity }
                    : i
                );
              } else {
                return [...prevInv, currentHotbarItem];
              }
            });
          }
          
          newHotbar[targetIndex] = draggedItem;
          return newHotbar;
        });
        
        // Remove from inventory
        setInventory(prev => prev.filter(i => i.id !== draggedItem.id));
        
      } else if (dragSource.type === 'hotbar' && dragSource.index !== null) {
        // Swapping hotbar items
        setHotbar(prev => {
          const newHotbar = [...prev];
          newHotbar[dragSource.index] = currentHotbarItem;
          newHotbar[targetIndex] = draggedItem;
          return newHotbar;
        });
      }
    } else if (targetType === 'inventory') {
      if (dragSource.type === 'hotbar' && dragSource.index !== null) {
        // Moving from hotbar to inventory
        setInventory(prev => {
          const existing = prev.find(i => i.id === draggedItem.id);
          if (existing) {
            return prev.map(i => 
              i.id === draggedItem.id 
                ? { ...i, quantity: i.quantity + draggedItem.quantity }
                : i
            );
          } else {
            return [...prev, draggedItem];
          }
        });
        
        // Remove from hotbar
        setHotbar(prev => {
          const newHotbar = [...prev];
          newHotbar[dragSource.index] = null;
          return newHotbar;
        });
      }
    }
    
    setDraggedItem(null);
    setDragSource(null);
  };

  // Minigames (keeping the same complex ones)
  const ModApprovalMinigame = ({ onComplete, onFail }) => {
    const [formData, setFormData] = useState({
      name: '',
      reason: '',
      checkboxes: Array(6).fill(false)
    });
    const [movingCheckbox, setMovingCheckbox] = useState(-1);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setMovingCheckbox(Math.floor(Math.random() * 6));
      }, 2000);
      return () => clearInterval(interval);
    }, []);
    
    const handleSubmit = () => {
      if (formData.name && formData.reason && formData.checkboxes.every(c => c)) {
        onComplete();
      } else {
        addNotification("❌ Incomplete application!", 'error', 2000);
        onFail();
      }
    };
    
    return (
      <div className="bg-yellow-50 p-6 rounded border-4 border-yellow-600 max-w-md">
        <h3 className="text-lg font-bold mb-4 pixelated">📋 Farm Application Form</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Your Name:</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border-2 border-gray-400 rounded px-2 py-1"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Reason for Farm:</label>
            <select 
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full border-2 border-gray-400 rounded px-2 py-1"
            >
              <option value="">Select reason...</option>
              <option value="science">For science</option>
              <option value="annoy">To annoy mods</option>
              <option value="dunno">I dunno</option>
              <option value="profit">Profit!</option>
              <option value="chaos">Pure chaos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Agreements:</label>
            {formData.checkboxes.map((checked, index) => (
              <div 
                key={index} 
                className={`flex items-center mb-1 transition-all duration-300 ${
                  movingCheckbox === index ? 'transform translate-x-2' : ''
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={checked}
                  onChange={(e) => {
                    const newCheckboxes = [...formData.checkboxes];
                    newCheckboxes[index] = e.target.checked;
                    setFormData(prev => ({ ...prev, checkboxes: newCheckboxes }));
                  }}
                  className="mr-2"
                />
                <span className="text-xs">
                  {['I will not lag the server', 'I understand TPS limits', 'No griefing with cacti', 
                    'I accept blame for everything', 'Cacti are not weapons', 'Server rules apply'][index]}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Submit Application
          </button>
        </div>
      </div>
    );
  };

  const CactusLotteryMinigame = ({ onComplete, onFail }) => {
    const [attempts, setAttempts] = useState(0);
    const [result, setResult] = useState('');
    const [spinning, setSpinning] = useState(false);
    
    const spin = () => {
      setSpinning(true);
      setResult('');
      
      setTimeout(() => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // Rigged to succeed after 3-6 attempts
        const shouldWin = newAttempts >= 3 && (newAttempts >= 6 || Math.random() < 0.4);
        
        if (shouldWin) {
          setResult('🌵 CACTUS! YOU WIN!');
          setTimeout(() => onComplete(), 1000);
        } else {
          const losers = ['🍎', '🍌', '🍇', '🥕', '🌽'];
          setResult(`${losers[Math.floor(Math.random() * losers.length)]} Try again!`);
        }
        setSpinning(false);
      }, 2000);
    };
    
    return (
      <div className="bg-purple-50 p-6 rounded border-4 border-purple-600 max-w-md text-center">
        <h3 className="text-lg font-bold mb-4 pixelated">🎰 Cactus Lottery</h3>
        <div className="text-4xl mb-4 h-16 flex items-center justify-center">
          {spinning ? '🎲' : result || '❓'}
        </div>
        <p className="text-sm mb-4">Get a cactus to win! (Attempts: {attempts})</p>
        <button 
          onClick={spin}
          disabled={spinning}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {spinning ? 'Spinning...' : 'SPIN!'}
        </button>
      </div>
    );
  };

  const CountCactusMinigame = ({ onComplete, onFail }) => {
    const [phase, setPhase] = useState('memorize');
    const [grid, setGrid] = useState([]);
    const [cactusCount, setCactusCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3);
    const [userAnswer, setUserAnswer] = useState('');
    
    useEffect(() => {
      // Generate grid
      const newGrid = Array(81).fill(null).map(() => {
        return Math.random() < 0.3 ? '🌵' : ['🌱', '🌿', '🍄', '🪨', '🔥'][Math.floor(Math.random() * 5)];
      });
      const count = newGrid.filter(item => item === '🌵').length;
      setGrid(newGrid);
      setCactusCount(count);
      
      // Timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPhase('answer');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }, []);
    
    const checkAnswer = () => {
      if (parseInt(userAnswer) === cactusCount) {
        onComplete();
      } else {
        addNotification(`❌ Wrong! There were ${cactusCount} cacti`, 'error', 3000);
        onFail();
      }
    };
    
    return (
      <div className="bg-green-50 p-6 rounded border-4 border-green-600 max-w-lg">
        <h3 className="text-lg font-bold mb-4 pixelated">🧮 Count the Cacti</h3>
        
        {phase === 'memorize' ? (
          <>
            <p className="text-center mb-2">Memorize the cacti! Time: {timeLeft}s</p>
            <div className="grid grid-cols-9 gap-1 w-full max-w-md mx-auto">
              {grid.map((item, index) => (
                <div key={index} className="w-6 h-6 text-sm text-center">
                  {item}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-center mb-4">How many cacti did you see?</p>
            <div className="flex items-center justify-center space-x-2">
              <input 
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="border-2 border-gray-400 rounded px-2 py-1 w-20 text-center"
                placeholder="?"
              />
              <button 
                onClick={checkAnswer}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // NPC Animation System (keeping same)
  const spawnCultist = () => {
    setNpcAnimation({
      type: 'cultist',
      phase: 'entering',
      direction: Math.random() < 0.5 ? 'left' : 'right',
      position: 0
    });
    
    addNotification("🌵 A mysterious cult approaches your farm... 🌵", 'cultist', 4000);
  };

  const spawnModerator = () => {
    const mod = CONFIG.mods[Math.floor(Math.random() * CONFIG.mods.length)];
    setNpcAnimation({
      type: 'moderator',
      phase: 'entering',
      direction: 'left',
      position: 0,
      character: mod,
      message: "Let me check your farm setup... 🤔"
    });
  };

  // Random events
  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.005 && totalCactiHarvested > 20) {
        spawnCultist();
      }
      if (Math.random() < 0.003 && autoFarms.length > 0) {
        spawnModerator();
      }
    }, 1000);

    return () => clearInterval(eventInterval);
  }, [totalCactiHarvested, autoFarms.length]);

  // NPC Animation Controller (keeping same)
  useEffect(() => {
    if (!npcAnimation) return;
    
    const animationInterval = setInterval(() => {
      setNpcAnimation(prev => {
        if (!prev) return null;
        
        if (prev.phase === 'entering') {
          if (prev.position >= 50) {
            return { ...prev, phase: 'action', position: 50 };
          }
          return { ...prev, position: prev.position + 2 };
        } else if (prev.phase === 'action') {
          setTimeout(() => {
            setNpcAnimation(prev => prev ? { ...prev, phase: 'leaving' } : null);
          }, 3000);
          return prev;
        } else if (prev.phase === 'leaving') {
          if (prev.position <= -20 || prev.position >= 120) {
            return null;
          }
          const direction = prev.direction === 'left' ? -2 : 2;
          return { ...prev, position: prev.position + direction };
        }
        
        return prev;
      });
    }, 100);
    
    return () => clearInterval(animationInterval);
  }, [npcAnimation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 to-yellow-200 overflow-hidden">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {notifications.map(notif => (
          <div key={notif.id} 
               className={`p-3 rounded-lg pixelated text-sm max-w-sm animate-fade-in ${
                 notif.type === 'blame' ? 'bg-red-500 text-white' :
                 notif.type === 'cultist' ? 'bg-purple-500 text-white' :
                 notif.type === 'source' ? 'bg-green-500 text-white' :
                 notif.type === 'growth' ? 'bg-blue-500 text-white' :
                 notif.type === 'warning' ? 'bg-orange-500 text-white' :
                 'bg-gray-700 text-white'
               }`}>
            {notif.message}
          </div>
        ))}
      </div>

      {/* NPC Animation Overlay */}
      {npcAnimation && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div 
            className="absolute bottom-20 transition-all duration-100"
            style={{ 
              left: `${npcAnimation.position}%`,
              transform: npcAnimation.direction === 'right' ? 'scaleX(-1)' : 'scaleX(1)'
            }}
          >
            {npcAnimation.type === 'cultist' ? (
              <div className="text-center">
                <div className="text-6xl animate-bounce">
                  {npcAnimation.phase === 'action' ? '🙇‍♂️' : '🧙‍♂️'}
                </div>
                {npcAnimation.phase === 'action' && (
                  <div className="bg-purple-600 text-white p-2 rounded-lg mt-2 text-xs pixelated">
                    "The great cactus brings wisdom!" 🌵
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl">
                  {npcAnimation.character?.avatar}
                </div>
                {npcAnimation.phase === 'action' && (
                  <div className="bg-blue-600 text-white p-2 rounded-lg mt-2 text-xs pixelated">
                    {npcAnimation.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header UI */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-3 z-30">
        <div className="flex justify-between items-center pixelated">
          <div className="flex space-x-6 text-sm">
            <span>💰 Source: {Math.floor(source)}</span>
            <span className={`${tps < 10 ? 'text-red-400' : tps < 15 ? 'text-yellow-400' : 'text-green-400'}`}>
              ⚡ TPS: {tps.toFixed(1)}/20
            </span>
            <span>🌵 Harvested: {totalCactiHarvested}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowInventory(!showInventory)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
            >
              🎒 Inventory
            </button>
            <button 
              onClick={() => setShowShop(!showShop)}
              className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs"
            >
              🛒 Shop
            </button>
          </div>
        </div>
      </div>

      {/* Hotbar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-1 bg-gray-800 p-2 rounded-lg">
          {hotbar.map((item, index) => (
            <div
              key={index}
              className={`w-12 h-12 border-2 rounded cursor-pointer flex items-center justify-center text-lg ${
                selectedHotbarSlot === index ? 'border-yellow-400 bg-yellow-900' : 'border-gray-600 bg-gray-700'
              }`}
              onClick={() => setSelectedHotbarSlot(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'hotbar', index)}
            >
              {item && (
                <div 
                  className="relative"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item, 'hotbar', index)}
                >
                  <span>{item.icon}</span>
                  {item.quantity > 1 && (
                    <span className="absolute -bottom-1 -right-1 text-xs text-yellow-400">
                      {item.quantity}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-white text-xs pixelated mt-1">
          Use arrow keys to scroll • 1-5 keys for hotbar • Click to interact
        </div>
      </div>

      {/* Game World */}
      <div 
        className="fixed top-16 left-0 right-0 bottom-20 overflow-hidden cursor-crosshair"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1598639461728-809b292f14b9?w=1200&h=600&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: `${-scrollPosition * 0.3}px center`
        }}
      >
        <div 
          ref={gameWorldRef}
          className="absolute inset-0"
          style={{
            width: CONFIG.world.width,
            transform: `translateX(-${scrollPosition}px)`
          }}
          onClick={handleWorldClick}
        >
          {/* Ground Line */}
          <div 
            className="absolute w-full h-1 bg-brown-600"
            style={{ top: CONFIG.world.groundLevel }}
          />

          {/* Farming Blocks Visualization (Single Row) */}
          {Object.entries(farmingBlocks).map(([blockX, block]) => {
            const worldX = getWorldX(parseInt(blockX));
            return (
              <div
                key={blockX}
                className="absolute border border-green-300 border-opacity-50"
                style={{
                  left: worldX,
                  top: CONFIG.world.groundLevel - CONFIG.world.blockSize,
                  width: CONFIG.world.blockSize,
                  height: CONFIG.world.blockSize,
                  backgroundColor: block.occupied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
                }}
              />
            );
          })}

          {/* Manual Crops */}
          {manualCrops.map(crop => {
            const worldX = getWorldX(crop.blockX);
            const growthHeight = 20 + (crop.growth / 100) * 50;
            
            return (
              <div
                key={crop.id}
                className="absolute flex items-end justify-center"
                style={{
                  left: worldX,
                  top: CONFIG.world.groundLevel - CONFIG.world.blockSize,
                  width: CONFIG.world.blockSize,
                  height: CONFIG.world.blockSize
                }}
              >
                <div 
                  className={`bg-green-500 border-2 border-green-700 rounded-t-lg transition-all duration-300 flex items-center justify-center ${
                    crop.growth >= 100 ? 'animate-pulse shadow-lg shadow-green-400' : ''
                  }`}
                  style={{
                    width: '60px',
                    height: `${growthHeight}px`
                  }}
                >
                  <span className="text-2xl">
                    {crop.growth >= 100 ? '🌵' : crop.growth >= 50 ? '🌱' : '🟫'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Auto Farms */}
          {autoFarms.map(farm => {
            const farmType = CONFIG.farmTypes.find(ft => ft.id === farm.type);
            const worldX = getWorldX(farm.blockX);
            
            return (
              <div
                key={farm.id}
                className="absolute border-4 border-gray-600 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center"
                style={{
                  left: worldX,
                  top: CONFIG.world.groundLevel - CONFIG.world.blockSize,
                  width: farmType.size.width * CONFIG.world.blockSize,
                  height: CONFIG.world.blockSize
                }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-1">{farmType.icon}</div>
                  <div className="text-xs font-bold pixelated">{farmType.name}</div>
                  <div className="text-xs">+{farmType.production}/2s</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold pixelated">🎒 Inventory</h2>
              <button 
                onClick={() => setShowInventory(false)}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>
            
            <div 
              className="grid grid-cols-8 gap-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'inventory')}
            >
              {Array.from({ length: 24 }, (_, index) => {
                const item = inventory[index];
                return (
                  <div
                    key={index}
                    className="w-16 h-16 border-2 border-gray-400 rounded bg-gray-100 flex items-center justify-center relative cursor-pointer hover:bg-gray-200"
                  >
                    {item && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, 'inventory')}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        {item.quantity > 1 && (
                          <span className="absolute -bottom-1 -right-1 text-xs bg-blue-500 text-white rounded px-1">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold pixelated">🛒 Shop</h2>
              <button 
                onClick={() => setShowShop(false)}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Seeds */}
              <div>
                <h3 className="text-lg font-bold mb-2 pixelated">🌰 Seeds</h3>
                {CONFIG.items.seeds.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => purchaseItem(item)}
                    disabled={source < item.cost}
                    className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                      source >= item.cost ? 'bg-green-100 border-green-400 hover:bg-green-200' : 'bg-gray-100 border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs">💰 {item.cost} Source</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Wands */}
              <div>
                <h3 className="text-lg font-bold mb-2 pixelated">🪄 Wands</h3>
                {CONFIG.items.wands.filter(w => w.cost > 0).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => purchaseItem(item)}
                    disabled={source < item.cost}
                    className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                      source >= item.cost ? 'bg-purple-100 border-purple-400 hover:bg-purple-200' : 'bg-gray-100 border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs">Growth: {item.growthPower}x</div>
                        <div className="text-xs">💰 {item.cost} Source</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Hoes */}
              <div>
                <h3 className="text-lg font-bold mb-2 pixelated">🔧 Hoes</h3>
                {CONFIG.items.hoes.filter(h => h.cost > 0).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => purchaseItem(item)}
                    disabled={source < item.cost}
                    className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                      source >= item.cost ? 'bg-brown-100 border-brown-400 hover:bg-brown-200' : 'bg-gray-100 border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs">Harvest: {item.harvestPower}x</div>
                        <div className="text-xs">💰 {item.cost} Source</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Farms */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2 pixelated">🏗️ Farms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONFIG.farmTypes.map((farmType) => (
                  <button
                    key={farmType.id}
                    onClick={() => purchaseItem({ ...farmType, icon: farmType.icon })}
                    disabled={source < farmType.cost}
                    className={`p-4 rounded border-2 text-sm ${
                      source >= farmType.cost ? 'bg-blue-100 border-blue-400 hover:bg-blue-200' : 'bg-gray-100 border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{farmType.icon}</div>
                      <div className="font-bold">{farmType.name}</div>
                      <div className="text-xs">{farmType.description}</div>
                      <div className="text-xs mt-1">Size: {farmType.size.width} blocks</div>
                      <div className="text-xs font-bold text-blue-600">💰 {farmType.cost} Source</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minigame Modal */}
      {activeMinigame && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            {activeMinigame.type === 'mod_approval' && (
              <ModApprovalMinigame 
                onComplete={() => setActiveMinigame(null)}
                onFail={() => setActiveMinigame(null)}
              />
            )}
            {activeMinigame.type === 'cactus_lottery' && (
              <CactusLotteryMinigame 
                onComplete={() => setActiveMinigame(null)}
                onFail={() => setActiveMinigame(null)}
              />
            )}
            {activeMinigame.type === 'count_cactus' && (
              <CountCactusMinigame 
                onComplete={() => setActiveMinigame(null)}
                onFail={() => setActiveMinigame(null)}
              />
            )}
            <button 
              onClick={() => setActiveMinigame(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;