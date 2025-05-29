import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Game Configuration - Easily customizable
const CONFIG = {
  source: {
    basePerCactus: 1,
    multiplier: 1
  },
  tps: {
    maxTPS: 20,
    tpsDecayRate: 0.1
  },
  tools: {
    wand: {
      baseCost: 10,
      upgrades: [
        { name: "Iron Wand", cost: 50, growthPower: 2, description: "2x growth power" },
        { name: "Diamond Wand", cost: 200, growthPower: 3, aoe: 1, description: "3x power + small AOE" },
        { name: "Netherite Wand", cost: 500, growthPower: 4, aoe: 2, dragGrow: true, description: "4x power + AOE + drag to grow" }
      ]
    },
    hoe: {
      baseCost: 15,
      upgrades: [
        { name: "Iron Hoe", cost: 75, harvestPower: 2, description: "2x harvest efficiency" },
        { name: "Diamond Hoe", cost: 300, harvestPower: 3, aoe: 1, description: "3x efficiency + small AOE" },
        { name: "Scythe of Souls", cost: 800, harvestPower: 5, aoe: 2, dragHarvest: true, description: "5x efficiency + AOE + drag harvest" }
      ]
    }
  },
  players: [
    { name: "xXCreeperKillerXx", avatar: "😎" },
    { name: "BuilderBob", avatar: "🔨" },
    { name: "RedstoneWiz", avatar: "⚡" },
    { name: "DiamondHunter", avatar: "💎" },
    { name: "CactusHater2024", avatar: "😡" }
  ],
  mods: [
    { name: "ServerAdmin_Mike", avatar: "👮", personality: "passive-aggressive" },
    { name: "Mod_Sarah", avatar: "🛡️", personality: "helpful-but-concerned" }
  ],
  achievements: [
    { id: "first_plant", name: "Green Thumb", description: "Plant your first cactus", requirement: "plant", count: 1 },
    { id: "chaos_begins", name: "Chaos Begins", description: "Harvest 100 cacti", requirement: "harvest", count: 100 },
    { id: "server_killer", name: "Server Killer", description: "Drop TPS below 10", requirement: "tps", count: 10 },
    { id: "cult_following", name: "Cult Following", description: "Have cultists visit your farm", requirement: "cultist", count: 1 },
    { id: "blame_master", name: "Blame Master", description: "Get blamed 20 times", requirement: "blame", count: 20 }
  ],
  serverCrash: {
    timerMinutes: 15,
    enabled: true
  }
};

function App() {
  // Game State
  const [source, setSource] = useState(0);
  const [tps, setTPS] = useState(20);
  const [totalCactiPlanted, setTotalCactiPlanted] = useState(0);
  const [totalCactiHarvested, setTotalCactiHarvested] = useState(0);
  const [blameCount, setBlameCount] = useState(0);
  
  // Tools
  const [currentWand, setCurrentWand] = useState({ name: "Wooden Wand", growthPower: 1, aoe: 0 });
  const [currentHoe, setCurrentHoe] = useState({ name: "Wooden Hoe", harvestPower: 1, aoe: 0 });
  const [selectedTool, setSelectedTool] = useState('wand');
  const [isDragging, setIsDragging] = useState(false);
  
  // Farm Grid (10x10)
  const [farmGrid, setFarmGrid] = useState(() => {
    const grid = [];
    for (let i = 0; i < 100; i++) {
      grid.push({
        id: i,
        planted: false,
        growth: 0,
        maxGrowth: 100,
        harvestable: false
      });
    }
    return grid;
  });
  
  // UI State
  const [showShop, setShowShop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [cultistVisible, setCultistVisible] = useState(false);
  const [modInspecting, setModInspecting] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [gameStartTime] = useState(Date.now());
  
  // Refs
  const farmRef = useRef(null);
  const cultistTimeoutRef = useRef(null);
  const modTimeoutRef = useRef(null);
  const crashTimeoutRef = useRef(null);

  // Notification system
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  // Achievement system
  const checkAchievements = useCallback((type, value) => {
    CONFIG.achievements.forEach(achievement => {
      if (achievement.requirement === type && !achievements.includes(achievement.id)) {
        if ((type === 'plant' && totalCactiPlanted >= achievement.count) ||
            (type === 'harvest' && totalCactiHarvested >= achievement.count) ||
            (type === 'tps' && tps <= achievement.count) ||
            (type === 'blame' && blameCount >= achievement.count) ||
            (type === 'cultist' && value)) {
          setAchievements(prev => [...prev, achievement.id]);
          addNotification(`🏆 Achievement: ${achievement.name}`, 'achievement', 5000);
        }
      }
    });
  }, [achievements, totalCactiPlanted, totalCactiHarvested, tps, blameCount, addNotification]);

  // Random blame events
  const triggerBlameEvent = useCallback(() => {
    const blameMessages = [
      "Server lag detected... is it the cactus farm again?",
      "My sheep are glitching through walls! @CactusFarmer fix your farm!",
      "The moon is square now. This has to be related to those cacti somehow...",
      "My redstone stopped working. Must be the cactus electromagnetic interference!",
      "The villagers are speaking backwards! CACTUS CURSE!",
      "Water is flowing upward near spawn... cactus magic strikes again!",
      "My diamonds turned into dirt! This is cactus sabotage!"
    ];
    
    const randomPlayer = CONFIG.players[Math.floor(Math.random() * CONFIG.players.length)];
    const randomMessage = blameMessages[Math.floor(Math.random() * blameMessages.length)];
    
    addNotification(`${randomPlayer.avatar} ${randomPlayer.name}: ${randomMessage}`, 'blame', 6000);
    setBlameCount(prev => prev + 1);
    checkAchievements('blame', blameCount + 1);
  }, [addNotification, blameCount, checkAchievements]);

  // Mod inspection events
  const triggerModInspection = useCallback(() => {
    const mod = CONFIG.mods[Math.floor(Math.random() * CONFIG.mods.length)];
    const inspectionMessages = [
      "Hmm, checking your tick usage... interesting numbers here...",
      "Your farm seems... suspiciously efficient. 🤔",
      "Everything appears normal... *suspicious glances*",
      "The server metrics are... concerning. Keep an eye on it.",
      "I'll be watching your farm activity more closely."
    ];
    
    setModInspecting(mod);
    addNotification(`${mod.avatar} ${mod.name}: ${inspectionMessages[Math.floor(Math.random() * inspectionMessages.length)]}`, 'mod', 8000);
    
    setTimeout(() => setModInspecting(null), 10000);
  }, [addNotification]);

  // Cultist appearances
  const spawnCultist = useCallback(() => {
    setCultistVisible(true);
    addNotification("🌵 Desert cultists have arrived to worship your magnificent farm! 🌵", 'cultist', 4000);
    checkAchievements('cultist', true);
    
    setTimeout(() => setCultistVisible(false), 8000);
  }, [addNotification, checkAchievements]);

  // Server crash simulation
  const triggerServerCrash = useCallback(() => {
    const crashOverlay = document.createElement('div');
    crashOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
      background: linear-gradient(45deg, #ff0000, #000000); 
      color: white; font-family: 'Press Start 2P'; font-size: 2rem; 
      display: flex; flex-direction: column; align-items: center; justify-content: center; 
      z-index: 10000; animation: crashFlash 0.5s infinite;
    `;
    crashOverlay.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1 style="margin-bottom: 2rem;">🚨 SERVER CRASH IMMINENT 🚨</h1>
        <p style="margin-bottom: 1rem;">Reason: Cactus Farm Overload</p>
        <p style="margin-bottom: 2rem;">TPS: ${tps.toFixed(1)}/20</p>
        <p style="font-size: 1rem;">Shutting down in 3 seconds...</p>
      </div>
    `;
    
    document.body.appendChild(crashOverlay);
    
    setTimeout(() => {
      document.body.removeChild(crashOverlay);
      // Reset some game state
      setTPS(20);
      addNotification("Server restarted. Please be more careful with your cactus farm.", 'system', 5000);
    }, 3000);
  }, [tps, addNotification]);

  // TPS calculation
  useEffect(() => {
    const activeFarms = farmGrid.filter(plot => plot.planted).length;
    const newTPS = Math.max(1, CONFIG.tps.maxTPS - (activeFarms * CONFIG.tps.tpsDecayRate) - (totalCactiHarvested * 0.001));
    setTPS(newTPS);
    
    checkAchievements('tps', newTPS);
    
    // Random events based on TPS
    if (newTPS < 15 && Math.random() < 0.01) {
      triggerBlameEvent();
    }
    if (newTPS < 10 && Math.random() < 0.005) {
      triggerModInspection();
    }
  }, [farmGrid, totalCactiHarvested, triggerBlameEvent, triggerModInspection, checkAchievements]);

  // Random events
  useEffect(() => {
    const eventInterval = setInterval(() => {
      // Random cultist spawn (rare)
      if (Math.random() < 0.003 && totalCactiPlanted > 10) {
        spawnCultist();
      }
      
      // Random blame events
      if (Math.random() < 0.01 && totalCactiHarvested > 5) {
        triggerBlameEvent();
      }
    }, 1000);

    return () => clearInterval(eventInterval);
  }, [totalCactiPlanted, totalCactiHarvested, spawnCultist, triggerBlameEvent]);

  // Server crash timer
  useEffect(() => {
    if (CONFIG.serverCrash.enabled) {
      crashTimeoutRef.current = setTimeout(() => {
        triggerServerCrash();
      }, CONFIG.serverCrash.timerMinutes * 60 * 1000);
    }
    
    return () => {
      if (crashTimeoutRef.current) {
        clearTimeout(crashTimeoutRef.current);
      }
    };
  }, [triggerServerCrash]);

  // Handle plot interaction
  const handlePlotClick = (plotIndex) => {
    const plot = farmGrid[plotIndex];
    
    if (selectedTool === 'wand') {
      if (!plot.planted) {
        // Plant cactus
        setFarmGrid(prev => {
          const newGrid = [...prev];
          newGrid[plotIndex] = { ...plot, planted: true, growth: 10 };
          return newGrid;
        });
        setTotalCactiPlanted(prev => prev + 1);
        checkAchievements('plant', totalCactiPlanted + 1);
      } else if (plot.growth < plot.maxGrowth) {
        // Grow cactus
        const growthIncrease = currentWand.growthPower * 10;
        setFarmGrid(prev => {
          const newGrid = [...prev];
          const newGrowth = Math.min(plot.maxGrowth, plot.growth + growthIncrease);
          newGrid[plotIndex] = { 
            ...plot, 
            growth: newGrowth,
            harvestable: newGrowth >= plot.maxGrowth
          };
          return newGrid;
        });
      }
    } else if (selectedTool === 'hoe' && plot.harvestable) {
      // Harvest cactus
      const sourceGained = CONFIG.source.basePerCactus * currentHoe.harvestPower * CONFIG.source.multiplier;
      setSource(prev => prev + sourceGained);
      setTotalCactiHarvested(prev => prev + 1);
      
      setFarmGrid(prev => {
        const newGrid = [...prev];
        newGrid[plotIndex] = { 
          id: plotIndex,
          planted: false,
          growth: 0,
          maxGrowth: 100,
          harvestable: false
        };
        return newGrid;
      });
      
      addNotification(`+${sourceGained} Source`, 'source', 1000);
      checkAchievements('harvest', totalCactiHarvested + 1);
    }
  };

  // Tool purchase
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

  const getPlotStyle = (plot) => {
    let style = "w-8 h-8 border border-gray-400 cursor-pointer transition-all duration-200 ";
    
    if (!plot.planted) {
      style += "bg-yellow-200 hover:bg-yellow-300";
    } else if (plot.harvestable) {
      style += "bg-green-400 hover:bg-green-500";
    } else {
      const growthPercent = (plot.growth / plot.maxGrowth) * 100;
      if (growthPercent < 33) {
        style += "bg-green-100";
      } else if (growthPercent < 66) {
        style += "bg-green-200";
      } else {
        style += "bg-green-300";
      }
    }
    
    return style;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-300 p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div key={notif.id} 
               className={`p-3 rounded-lg pixelated text-sm max-w-sm animate-fade-in ${
                 notif.type === 'blame' ? 'bg-red-500 text-white' :
                 notif.type === 'mod' ? 'bg-blue-500 text-white' :
                 notif.type === 'cultist' ? 'bg-purple-500 text-white' :
                 notif.type === 'achievement' ? 'bg-yellow-500 text-black' :
                 notif.type === 'source' ? 'bg-green-500 text-white' :
                 'bg-gray-700 text-white'
               }`}>
            {notif.message}
          </div>
        ))}
      </div>

      {/* Cultist Overlay */}
      {cultistVisible && (
        <div className="fixed bottom-4 left-4 z-40 animate-fade-in">
          <div className="bg-purple-600 text-white p-4 rounded-lg pixelated border-4 border-purple-800">
            <div className="text-4xl mb-2">🧙‍♂️🌵🧙‍♀️</div>
            <p className="text-sm">The Cactus Cultists bow before your magnificent farm!</p>
          </div>
        </div>
      )}

      {/* Mod Inspector */}
      {modInspecting && (
        <div className="fixed top-1/2 left-4 z-40 animate-fade-in">
          <div className="bg-blue-600 text-white p-4 rounded-lg pixelated border-4 border-blue-800">
            <div className="text-2xl mb-2">{modInspecting.avatar} {modInspecting.name}</div>
            <p className="text-sm">*inspecting your farm suspiciously*</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-green-800 mb-2 pixelated">
            🌵 INTERACTIVE CACTUS FARM CHAOS 🌵
          </h1>
          <p className="text-lg text-green-700 pixelated">
            Manual farming madness - Now with 100% more interaction!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 pixelated">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-yellow-400 font-bold">Source</div>
              <div className="text-2xl">{Math.floor(source)}</div>
            </div>
            <div>
              <div className="text-red-400 font-bold">TPS</div>
              <div className={`text-2xl ${tps < 10 ? 'text-red-400 animate-pulse' : tps < 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                {tps.toFixed(1)}/20
              </div>
            </div>
            <div>
              <div className="text-green-400 font-bold">Planted</div>
              <div className="text-2xl">{totalCactiPlanted}</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold">Harvested</div>
              <div className="text-2xl">{totalCactiHarvested}</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">Blamed</div>
              <div className="text-2xl">{blameCount}</div>
            </div>
            <div>
              <div className="text-orange-400 font-bold">Achievements</div>
              <div className="text-2xl">{achievements.length}/{CONFIG.achievements.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Farm Grid */}
          <div className="lg:col-span-3">
            <div className="bg-yellow-100 border-4 border-yellow-600 rounded-lg p-6 pixelated">
              <h2 className="text-2xl font-bold text-green-800 mb-4">🌾 Interactive Farm Grid</h2>
              
              {/* Tool Selection */}
              <div className="mb-4 flex gap-4">
                <button 
                  onClick={() => setSelectedTool('wand')}
                  className={`px-4 py-2 rounded pixelated border-2 ${
                    selectedTool === 'wand' ? 'bg-purple-500 text-white border-purple-700' : 'bg-gray-200 border-gray-400'
                  }`}
                >
                  🪄 {currentWand.name}
                </button>
                <button 
                  onClick={() => setSelectedTool('hoe')}
                  className={`px-4 py-2 rounded pixelated border-2 ${
                    selectedTool === 'hoe' ? 'bg-brown-500 text-white border-brown-700' : 'bg-gray-200 border-gray-400'
                  }`}
                >
                  🌾 {currentHoe.name}
                </button>
              </div>

              {/* Farm Grid */}
              <div 
                ref={farmRef}
                className="grid grid-cols-10 gap-1 bg-brown-200 p-4 rounded border-4 border-brown-600"
                style={{ maxWidth: '400px', margin: '0 auto' }}
              >
                {farmGrid.map((plot, index) => (
                  <div
                    key={plot.id}
                    className={getPlotStyle(plot)}
                    onClick={() => handlePlotClick(index)}
                    title={
                      !plot.planted ? 'Empty plot - Click with wand to plant' :
                      plot.harvestable ? 'Ready to harvest - Click with hoe' :
                      `Growing: ${Math.floor((plot.growth/plot.maxGrowth)*100)}%`
                    }
                  >
                    {!plot.planted ? '' : 
                     plot.harvestable ? '🌵' : 
                     plot.growth > 50 ? '🌱' : '🟫'}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-gray-600 pixelated">
                {selectedTool === 'wand' ? 
                  '🪄 Wand Mode: Click empty plots to plant, click growing cacti to boost growth' :
                  '🌾 Hoe Mode: Click mature cacti (🌵) to harvest for Source'
                }
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Shop Button */}
            <button 
              onClick={() => setShowShop(!showShop)}
              className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 px-4 rounded-lg pixelated border-4 border-gold-700"
            >
              🛒 Tool Shop
            </button>

            {/* Shop */}
            {showShop && (
              <div className="bg-brown-100 border-4 border-brown-600 rounded-lg p-4 pixelated">
                <h3 className="text-lg font-bold mb-3">🪄 Wand Upgrades</h3>
                {CONFIG.tools.wand.upgrades.map((upgrade, index) => (
                  <button
                    key={index}
                    onClick={() => purchaseTool('wand', upgrade)}
                    disabled={source < upgrade.cost}
                    className={`w-full mb-2 p-2 rounded border-2 text-sm ${
                      source >= upgrade.cost ? 'bg-purple-200 border-purple-400 hover:bg-purple-300' : 'bg-gray-200 border-gray-400'
                    }`}
                  >
                    <div className="font-bold">{upgrade.name}</div>
                    <div className="text-xs">{upgrade.description}</div>
                    <div className="text-xs">Cost: {upgrade.cost} Source</div>
                  </button>
                ))}

                <h3 className="text-lg font-bold mb-3 mt-4">🌾 Hoe Upgrades</h3>
                {CONFIG.tools.hoe.upgrades.map((upgrade, index) => (
                  <button
                    key={index}
                    onClick={() => purchaseTool('hoe', upgrade)}
                    disabled={source < upgrade.cost}
                    className={`w-full mb-2 p-2 rounded border-2 text-sm ${
                      source >= upgrade.cost ? 'bg-brown-200 border-brown-400 hover:bg-brown-300' : 'bg-gray-200 border-gray-400'
                    }`}
                  >
                    <div className="font-bold">{upgrade.name}</div>
                    <div className="text-xs">{upgrade.description}</div>
                    <div className="text-xs">Cost: {upgrade.cost} Source</div>
                  </button>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-100 border-4 border-blue-600 rounded-lg p-4 pixelated text-sm">
              <h3 className="font-bold mb-2">📚 How to Play</h3>
              <ul className="space-y-1 text-xs">
                <li>1. Select wand, click empty plots to plant</li>
                <li>2. Click planted cacti to boost growth</li>
                <li>3. Switch to hoe, harvest mature cacti</li>
                <li>4. Use Source to buy better tools</li>
                <li>5. Watch TPS drop as chaos ensues</li>
                <li>6. Get blamed for everything!</li>
              </ul>
            </div>

            {/* Achievements */}
            <div className="bg-yellow-100 border-4 border-yellow-600 rounded-lg p-4 pixelated text-sm">
              <h3 className="font-bold mb-2">🏆 Achievements</h3>
              <div className="space-y-1">
                {CONFIG.achievements.map(achievement => (
                  <div key={achievement.id} className={`text-xs ${achievements.includes(achievement.id) ? 'text-yellow-600 font-bold' : 'text-gray-500'}`}>
                    {achievements.includes(achievement.id) ? '✅' : '🔒'} {achievement.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;