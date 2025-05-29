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
    width: 3000, // Scrollable world width
    viewportWidth: 1200
  },
  tools: {
    wand: {
      upgrades: [
        { name: "Oak Wand", cost: 50, growthPower: 2, description: "2x growth magic" },
        { name: "Silverwood Wand", cost: 200, growthPower: 4, aoe: 50, description: "4x power + growth aura" },
        { name: "Thaumcraft Focus", cost: 500, growthPower: 6, aoe: 100, description: "6x power + large aura" }
      ]
    },
    hoe: {
      upgrades: [
        { name: "Iron Hoe", cost: 75, harvestPower: 2, description: "2x harvest yield" },
        { name: "Mattock", cost: 300, harvestPower: 4, aoe: 50, description: "4x yield + harvest aura" },
        { name: "Kama", cost: 800, harvestPower: 6, aoe: 100, description: "6x yield + large aura" }
      ]
    }
  },
  farmTypes: [
    {
      id: 'vanilla_basic',
      name: 'Basic Cactus Farm',
      cost: 100,
      description: 'Simple vanilla Minecraft cactus farm',
      production: 1,
      setupGame: 'place_blocks',
      size: { width: 150, height: 100 }
    },
    {
      id: 'vanilla_advanced',
      name: 'Piston Cactus Farm',
      cost: 500,
      description: 'Automated piston-based harvester',
      production: 5,
      setupGame: 'redstone_circuit',
      size: { width: 200, height: 120 }
    },
    {
      id: 'mystical_agriculture',
      name: 'Mystical Agriculture Plot',
      cost: 1000,
      description: 'Magical essence-infused growing',
      production: 10,
      setupGame: 'essence_infusion',
      size: { width: 180, height: 110 }
    },
    {
      id: 'industrial_foregoing',
      name: 'Plant Gatherer',
      cost: 2000,
      description: 'High-tech automated harvesting',
      production: 20,
      setupGame: 'machine_assembly',
      size: { width: 250, height: 140 }
    },
    {
      id: 'stardew_greenhouse',
      name: 'Stardew Greenhouse',
      cost: 3000,
      description: 'Year-round magical growing',
      production: 30,
      setupGame: 'sprinkler_setup',
      size: { width: 300, height: 160 }
    }
  ],
  farmUpgrades: [
    { name: "Lilypad of Fertility", cost: 200, effect: "2x production", multiplier: 2 },
    { name: "Growth Accelerator", cost: 500, effect: "3x production", multiplier: 3 },
    { name: "Time Torch", cost: 1000, effect: "5x production", multiplier: 5 },
    { name: "Imaginary Time Block", cost: 2000, effect: "10x production", multiplier: 10 }
  ],
  players: [
    { name: "BlockBuilder2024", avatar: "🧱" },
    { name: "RedstoneGuru", avatar: "⚡" },
    { name: "CactusHater", avatar: "😠" },
    { name: "ModdedPlayer", avatar: "🔧" }
  ],
  mods: [
    { name: "ServerAdmin_Alex", avatar: "👮" },
    { name: "Mod_Taylor", avatar: "🛡️" }
  ]
};

function App() {
  // Game State
  const [source, setSource] = useState(50);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tps, setTPS] = useState(20);
  const [totalCactiHarvested, setTotalCactiHarvested] = useState(0);
  const [blameCount, setBlameCount] = useState(0);
  
  // Tools
  const [currentWand, setCurrentWand] = useState({ name: "Wooden Wand", growthPower: 1, aoe: 0 });
  const [currentHoe, setCurrentHoe] = useState({ name: "Wooden Hoe", harvestPower: 1, aoe: 0 });
  const [selectedTool, setSelectedTool] = useState('wand');
  
  // World Objects
  const [manualCacti, setManualCacti] = useState([]); // Player-planted cacti
  const [autoFarms, setAutoFarms] = useState([]); // Built automatic farms
  const [gameObjects, setGameObjects] = useState([]); // Environmental objects
  
  // UI State
  const [showShop, setShowShop] = useState(false);
  const [showFarmBuilder, setShowFarmBuilder] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [cultistVisible, setCultistVisible] = useState(false);
  
  // Refs
  const gameWorldRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Notification system
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  // Auto farm production
  useEffect(() => {
    const interval = setInterval(() => {
      autoFarms.forEach(farm => {
        const farmType = CONFIG.farmTypes.find(ft => ft.id === farm.type);
        const totalProduction = farmType.production * (farm.upgrades?.multiplier || 1);
        setSource(prev => prev + totalProduction);
        setTotalCactiHarvested(prev => prev + totalProduction);
      });
    }, 2000); // Production every 2 seconds

    return () => clearInterval(interval);
  }, [autoFarms]);

  // TPS calculation
  useEffect(() => {
    const activeFarms = autoFarms.length;
    const manualActivity = manualCacti.length;
    const newTPS = Math.max(1, CONFIG.tps.maxTPS - (activeFarms * 0.5) - (manualActivity * 0.1) - (totalCactiHarvested * 0.001));
    setTPS(newTPS);
  }, [autoFarms.length, manualCacti.length, totalCactiHarvested]);

  // Random events
  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.02 && totalCactiHarvested > 10) {
        triggerBlameEvent();
      }
      if (Math.random() < 0.005 && autoFarms.length > 0) {
        spawnCultist();
      }
    }, 1000);

    return () => clearInterval(eventInterval);
  }, [totalCactiHarvested, autoFarms.length]);

  const triggerBlameEvent = () => {
    const blameMessages = [
      "My villagers are dancing in circles! Must be the cactus energy!",
      "The nether portals are making cactus sounds! @CactusFarmer what did you do?!",
      "My chickens laid square eggs... CACTUS MAGIC!",
      "The server time is running backwards near the cactus farm!",
      "My enchanted books turned into cactus seeds! This is sabotage!"
    ];
    
    const randomPlayer = CONFIG.players[Math.floor(Math.random() * CONFIG.players.length)];
    const randomMessage = blameMessages[Math.floor(Math.random() * blameMessages.length)];
    
    addNotification(`${randomPlayer.avatar} ${randomPlayer.name}: ${randomMessage}`, 'blame', 6000);
    setBlameCount(prev => prev + 1);
  };

  const spawnCultist = () => {
    setCultistVisible(true);
    addNotification("🌵 Mysterious figures in robes approach your cactus empire... 🌵", 'cultist', 4000);
    setTimeout(() => setCultistVisible(false), 8000);
  };

  // Handle world clicking for manual farming
  const handleWorldClick = (event) => {
    const rect = gameWorldRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + scrollPosition;
    const y = event.clientY - rect.top;
    
    if (selectedTool === 'wand') {
      // Plant or grow cactus
      const existingCactus = manualCacti.find(c => 
        Math.abs(c.x - x) < 30 && Math.abs(c.y - y) < 30
      );
      
      if (existingCactus) {
        if (existingCactus.growth < 100) {
          // Grow existing cactus
          setManualCacti(prev => prev.map(c => 
            c.id === existingCactus.id 
              ? { ...c, growth: Math.min(100, c.growth + currentWand.growthPower * 25) }
              : c
          ));
          addNotification(`+${currentWand.growthPower * 25}% growth`, 'growth', 1000);
        }
      } else {
        // Plant new cactus
        const newCactus = {
          id: Date.now(),
          x: x,
          y: y,
          growth: 25,
          planted: true
        };
        setManualCacti(prev => [...prev, newCactus]);
        addNotification("🌱 Cactus planted!", 'plant', 1500);
      }
    } else if (selectedTool === 'hoe') {
      // Harvest mature cactus
      const matureCactus = manualCacti.find(c => 
        Math.abs(c.x - x) < 30 && Math.abs(c.y - y) < 30 && c.growth >= 100
      );
      
      if (matureCactus) {
        const sourceGained = CONFIG.source.basePerCactus * currentHoe.harvestPower;
        setSource(prev => prev + sourceGained);
        setTotalCactiHarvested(prev => prev + 1);
        setManualCacti(prev => prev.filter(c => c.id !== matureCactus.id));
        addNotification(`+${sourceGained} Source`, 'source', 1500);
      }
    }
  };

  // Scroll handling
  const handleScroll = (direction) => {
    const scrollAmount = 100;
    setScrollPosition(prev => {
      const newPos = prev + (direction === 'left' ? -scrollAmount : scrollAmount);
      return Math.max(0, Math.min(CONFIG.world.width - CONFIG.world.viewportWidth, newPos));
    });
  };

  // Farm building
  const buildFarm = (farmType) => {
    if (source >= farmType.cost) {
      setActiveMinigame({ farmType, onComplete: completeFarmBuild });
      setShowFarmBuilder(false);
    }
  };

  const completeFarmBuild = (farmType) => {
    setSource(prev => prev - farmType.cost);
    const newFarm = {
      id: Date.now(),
      type: farmType.id,
      x: scrollPosition + 200 + (autoFarms.length * 320),
      y: 300,
      upgrades: { multiplier: 1 }
    };
    setAutoFarms(prev => [...prev, newFarm]);
    setActiveMinigame(null);
    addNotification(`${farmType.name} built!`, 'farm', 3000);
  };

  // Tool purchases
  const purchaseTool = (toolType, upgrade) => {
    if (source >= upgrade.cost) {
      setSource(prev => prev - upgrade.cost);
      if (toolType === 'wand') {
        setCurrentWand(upgrade);
      } else {
        setCurrentHoe(upgrade);
      }
      addNotification(`Purchased ${upgrade.name}!`, 'purchase', 3000);
    }
  };

  // Minigame Components
  const MinigameModal = ({ minigame, onComplete, onCancel }) => {
    const [gameProgress, setGameProgress] = useState(0);
    const [gameStage, setGameStage] = useState(0);
    
    const handleMinigameClick = () => {
      setGameProgress(prev => prev + 20);
      if (gameProgress >= 80) {
        setTimeout(() => onComplete(minigame.farmType), 500);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4 pixelated">Building {minigame.farmType.name}</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Setup Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${gameProgress}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={handleMinigameClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded mb-2"
          >
            {gameProgress < 20 ? 'Place Foundation' :
             gameProgress < 40 ? 'Install Systems' :
             gameProgress < 60 ? 'Connect Power' :
             gameProgress < 80 ? 'Calibrate Settings' : 'Activate Farm!'}
          </button>
          <button 
            onClick={onCancel}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

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
                 notif.type === 'farm' ? 'bg-blue-500 text-white' :
                 'bg-gray-700 text-white'
               }`}>
            {notif.message}
          </div>
        ))}
      </div>

      {/* Cultist Overlay */}
      {cultistVisible && (
        <div className="fixed bottom-20 left-4 z-30 animate-fade-in">
          <div className="bg-purple-600 text-white p-4 rounded-lg pixelated border-4 border-purple-800">
            <div className="text-4xl mb-2">🧙‍♂️👁️🧙‍♀️</div>
            <p className="text-xs">The Order of the Sacred Spine observes...</p>
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
            <span>🎯 Blamed: {blameCount}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowShop(!showShop)}
              className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs"
            >
              🛒 Tools
            </button>
            <button 
              onClick={() => setShowFarmBuilder(!showFarmBuilder)}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
            >
              🏗️ Build Farm
            </button>
          </div>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="fixed bottom-4 left-4 z-30 flex space-x-2">
        <button 
          onClick={() => setSelectedTool('wand')}
          className={`px-4 py-2 rounded pixelated text-sm border-2 ${
            selectedTool === 'wand' ? 'bg-purple-500 text-white border-purple-700' : 'bg-gray-200 border-gray-400'
          }`}
        >
          🪄 {currentWand.name}
        </button>
        <button 
          onClick={() => setSelectedTool('hoe')}
          className={`px-4 py-2 rounded pixelated text-sm border-2 ${
            selectedTool === 'hoe' ? 'bg-brown-500 text-white border-brown-700' : 'bg-gray-200 border-gray-400'
          }`}
        >
          🔧 {currentHoe.name}
        </button>
      </div>

      {/* Scroll Controls */}
      <div className="fixed bottom-4 right-4 z-30 flex space-x-2">
        <button 
          onClick={() => handleScroll('left')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded pixelated"
          disabled={scrollPosition <= 0}
        >
          ⬅️
        </button>
        <button 
          onClick={() => handleScroll('right')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded pixelated"
          disabled={scrollPosition >= CONFIG.world.width - CONFIG.world.viewportWidth}
        >
          ➡️
        </button>
      </div>

      {/* Game World */}
      <div 
        ref={scrollContainerRef}
        className="fixed top-16 left-0 right-0 bottom-0 overflow-hidden cursor-crosshair"
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
          {/* Ground Layer */}
          <div 
            className="absolute bottom-0 w-full h-32"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1542639492-23184001faed?w=1200&h=200&fit=crop')`,
              backgroundRepeat: 'repeat-x'
            }}
          ></div>

          {/* Manual Cacti */}
          {manualCacti.map(cactus => (
            <div
              key={cactus.id}
              className="absolute transform -translate-x-1/2 -translate-y-full"
              style={{
                left: cactus.x,
                top: cactus.y,
                width: '30px',
                height: `${20 + (cactus.growth / 100) * 40}px`
              }}
            >
              <div 
                className={`w-full h-full bg-green-500 border-2 border-green-700 rounded-t-lg transition-all duration-300 ${
                  cactus.growth >= 100 ? 'animate-pulse shadow-lg shadow-green-400' : ''
                }`}
                style={{
                  backgroundImage: cactus.growth >= 100 ? 
                    `url('https://images.unsplash.com/photo-1565200269395-27dab1adfb0c?w=60&h=80&fit=crop')` : 
                    `url('https://images.unsplash.com/photo-1584408146321-4056f583abcf?w=60&h=80&fit=crop')`,
                  backgroundSize: 'cover'
                }}
              >
                {/* Growth indicator */}
                <div className="text-xs text-center text-white font-bold pt-1">
                  {Math.floor(cactus.growth)}%
                </div>
              </div>
            </div>
          ))}

          {/* Auto Farms */}
          {autoFarms.map(farm => {
            const farmType = CONFIG.farmTypes.find(ft => ft.id === farm.type);
            return (
              <div
                key={farm.id}
                className="absolute border-4 border-gray-600 bg-gray-300 rounded-lg shadow-lg"
                style={{
                  left: farm.x,
                  top: farm.y,
                  width: farmType.size.width,
                  height: farmType.size.height
                }}
              >
                <div className="p-2 text-center">
                  <div className="text-xs font-bold pixelated">{farmType.name}</div>
                  <div className="text-2xl">🏭</div>
                  <div className="text-xs">+{farmType.production * (farm.upgrades?.multiplier || 1)}/2s</div>
                </div>
              </div>
            );
          })}

          {/* Environmental Objects */}
          <div className="absolute bottom-32 left-500">
            <img 
              src="https://images.pexels.com/photos/4744868/pexels-photo-4744868.jpeg?w=100&h=100&fit=crop" 
              alt="Desert Plants" 
              className="w-20 h-20 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold pixelated">🛒 Tool Shop</h2>
              <button 
                onClick={() => setShowShop(false)}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-bold mb-2 pixelated">🪄 Magic Wands</h3>
                {CONFIG.tools.wand.upgrades.map((upgrade, index) => (
                  <button
                    key={index}
                    onClick={() => purchaseTool('wand', upgrade)}
                    disabled={source < upgrade.cost}
                    className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                      source >= upgrade.cost ? 'bg-purple-100 border-purple-400 hover:bg-purple-200' : 'bg-gray-100 border-gray-400'
                    }`}
                  >
                    <div className="font-bold">{upgrade.name}</div>
                    <div className="text-xs">{upgrade.description}</div>
                    <div className="text-xs font-bold">💰 {upgrade.cost} Source</div>
                  </button>
                ))}
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2 pixelated">🔧 Harvesting Tools</h3>
                {CONFIG.tools.hoe.upgrades.map((upgrade, index) => (
                  <button
                    key={index}
                    onClick={() => purchaseTool('hoe', upgrade)}
                    disabled={source < upgrade.cost}
                    className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                      source >= upgrade.cost ? 'bg-brown-100 border-brown-400 hover:bg-brown-200' : 'bg-gray-100 border-gray-400'
                    }`}
                  >
                    <div className="font-bold">{upgrade.name}</div>
                    <div className="text-xs">{upgrade.description}</div>
                    <div className="text-xs font-bold">💰 {upgrade.cost} Source</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farm Builder Modal */}
      {showFarmBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold pixelated">🏗️ Farm Builder</h2>
              <button 
                onClick={() => setShowFarmBuilder(false)}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONFIG.farmTypes.map((farmType) => (
                <div key={farmType.id} className="border-2 border-gray-300 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2 pixelated">{farmType.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{farmType.description}</p>
                  <div className="text-sm mb-2">
                    <div>Production: +{farmType.production}/2s</div>
                    <div className="font-bold text-green-600">💰 {farmType.cost} Source</div>
                  </div>
                  <button
                    onClick={() => buildFarm(farmType)}
                    disabled={source < farmType.cost}
                    className={`w-full py-2 px-4 rounded font-bold ${
                      source >= farmType.cost 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Build Farm
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Minigame Modal */}
      {activeMinigame && (
        <MinigameModal 
          minigame={activeMinigame}
          onComplete={completeFarmBuild}
          onCancel={() => setActiveMinigame(null)}
        />
      )}

      {/* Instructions Overlay */}
      <div className="fixed top-20 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg pixelated text-xs max-w-xs">
        <h4 className="font-bold mb-2">🎮 How to Play</h4>
        <ul className="space-y-1">
          <li>🪄 Wand: Click to plant & grow cacti</li>
          <li>🔧 Hoe: Click mature cacti to harvest</li>
          <li>⬅️➡️ Scroll to explore the world</li>
          <li>🏗️ Build automatic farms with minigames</li>
          <li>💰 Use Source to buy upgrades</li>
          <li>🌵 Watch chaos unfold!</li>
        </ul>
      </div>
    </div>
  );
}

export default App;