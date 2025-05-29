import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [cacti, setCacti] = useState(0);
  const [cactiPerSecond, setCactiPerSecond] = useState(1);
  const [farms, setFarms] = useState(1);
  const [serverHealth, setServerHealth] = useState(100);
  const [isLagging, setIsLagging] = useState(false);
  const [blameMessages, setBlameMessages] = useState([]);
  const [autoHarvest, setAutoHarvest] = useState(false);
  const [totalCactiHarvested, setTotalCactiHarvested] = useState(0);
  const [lagLevel, setLagLevel] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  const messageRef = useRef(null);
  const lagTimeoutRef = useRef(null);

  const blameTexts = [
    "Server lag detected... is it the cactus farm again?",
    "Discord User: @CactusChaos your farm is destroying everything!",
    "Mod: Can someone check what's causing this lag?",
    "Player joined the game... Server immediately lags... Hmm...",
    "Discord User: Every time something breaks, it's always the cactus farm 🌵",
    "Admin: The TPS is dropping... *looks suspiciously at cactus farm*",
    "Player: Why do we even need this many cacti?!",
    "Mod: *checks server stats* Yep, it's the cactus farm again",
    "Discord User: Plot twist: The lag was inside the cactus farm all along",
    "Server Alert: Unusual entity activity detected in Cactus Farm Sector"
  ];

  // Real-time cactus farming
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoHarvest) {
        setCacti(prev => {
          const newCacti = prev + (cactiPerSecond * farms);
          setTotalCactiHarvested(total => total + (cactiPerSecond * farms));
          return newCacti;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cactiPerSecond, farms, autoHarvest]);

  // Server health degradation
  useEffect(() => {
    const newHealth = Math.max(0, 100 - (totalCactiHarvested / 100));
    setServerHealth(newHealth);
    
    // Lag level calculation
    const newLagLevel = Math.floor(totalCactiHarvested / 500);
    setLagLevel(newLagLevel);
    
    if (newHealth < 50 && !showWarning) {
      setShowWarning(true);
    }
  }, [totalCactiHarvested, showWarning]);

  // Intentional lag simulation
  useEffect(() => {
    if (lagLevel > 0) {
      setIsLagging(true);
      
      // Create intentional performance hits
      const lagInterval = setInterval(() => {
        // Intentionally cause lag with pointless calculations
        for (let i = 0; i < lagLevel * 100000; i++) {
          Math.random() * Math.random();
        }
      }, 100);

      lagTimeoutRef.current = lagInterval;
      
      return () => clearInterval(lagInterval);
    } else {
      setIsLagging(false);
    }
  }, [lagLevel]);

  // Blame message generator
  const generateBlameMessage = () => {
    const randomMessage = blameTexts[Math.floor(Math.random() * blameTexts.length)];
    const newMessage = {
      id: Date.now(),
      text: randomMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setBlameMessages(prev => [...prev.slice(-4), newMessage]);
    
    setTimeout(() => {
      setBlameMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 5000);
  };

  const plantCactus = () => {
    setCacti(prev => prev + 1);
    setTotalCactiHarvested(prev => prev + 1);
    
    // Random chance to trigger blame message
    if (Math.random() < 0.3) {
      generateBlameMessage();
    }
  };

  const upgradeFarm = () => {
    if (cacti >= farms * 10) {
      setCacti(prev => prev - (farms * 10));
      setFarms(prev => prev + 1);
      generateBlameMessage();
    }
  };

  const upgradeSpeed = () => {
    if (cacti >= cactiPerSecond * 20) {
      setCacti(prev => prev - (cactiPerSecond * 20));
      setCactiPerSecond(prev => prev * 2);
      generateBlameMessage();
    }
  };

  const enableAutoHarvest = () => {
    if (cacti >= 50 && !autoHarvest) {
      setCacti(prev => prev - 50);
      setAutoHarvest(true);
      generateBlameMessage();
    }
  };

  const emergencyTearDown = () => {
    if (window.confirm("Are you sure you want to tear down the cactus farm? (Just like the real incident!)")) {
      setCacti(0);
      setFarms(1);
      setCactiPerSecond(1);
      setAutoHarvest(false);
      setBlameMessages([{
        id: Date.now(),
        text: "🚨 EMERGENCY SHUTDOWN: Cactus farm has been torn down for server stability",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-green-400 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-6xl font-bold text-green-800 mb-2 pixelated">
            🌵 CACTUS FARM CHAOS 🌵
          </h1>
          <p className="text-xl text-green-700 pixelated">
            "Why do we even need this many cacti?" - Everyone, probably
          </p>
        </div>

        {/* Server Health Warning */}
        {showWarning && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-4 border-4 border-red-800 pixelated animate-pulse">
            <h3 className="text-xl font-bold">⚠️ SERVER PERFORMANCE WARNING ⚠️</h3>
            <p>Your cactus farm is causing server instability. Consider tearing it down!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Farm Area */}
          <div className="lg:col-span-2">
            <div className="bg-yellow-100 border-4 border-yellow-600 rounded-lg p-6 pixelated">
              <h2 className="text-3xl font-bold text-green-800 mb-4">🌵 Cactus Farm</h2>
              
              {/* Cactus Display */}
              <div className="bg-green-100 border-2 border-green-600 rounded p-4 mb-6 min-h-64 relative overflow-hidden">
                <div className="text-center">
                  <div className="text-8xl mb-2">
                    {cacti < 10 ? '🌵'.repeat(Math.min(cacti, 5)) : 
                     cacti < 100 ? '🌵🌵🌵🌵🌵' + '🌱'.repeat(Math.min(cacti - 5, 10)) :
                     '🌵🌵🌵🌵🌵🌱🌱🌱🌱🌱🌿🌿🌿🌿🌿'}
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {cacti.toLocaleString()} Cacti
                  </p>
                  {autoHarvest && (
                    <p className="text-lg text-green-600 animate-pulse">
                      +{(cactiPerSecond * farms).toLocaleString()}/sec
                    </p>
                  )}
                </div>
                
                {/* Lag Effect */}
                {isLagging && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 animate-ping"></div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={plantCactus}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg pixelated text-xl border-4 border-green-800"
                >
                  🌱 Plant Cactus
                </button>
                
                <button 
                  onClick={enableAutoHarvest}
                  disabled={autoHarvest || cacti < 50}
                  className={`font-bold py-4 px-6 rounded-lg pixelated text-xl border-4 ${
                    autoHarvest ? 'bg-gray-400 border-gray-600 cursor-not-allowed' :
                    cacti >= 50 ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-800' :
                    'bg-gray-300 border-gray-500 cursor-not-allowed'
                  }`}
                >
                  {autoHarvest ? '✅ Auto-Harvest Active' : `🤖 Auto-Harvest (50 cacti)`}
                </button>
              </div>
            </div>

            {/* Upgrades */}
            <div className="bg-yellow-100 border-4 border-yellow-600 rounded-lg p-6 pixelated mt-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">🔧 Dangerous Upgrades</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={upgradeFarm}
                  disabled={cacti < farms * 10}
                  className={`font-bold py-3 px-4 rounded-lg pixelated border-4 ${
                    cacti >= farms * 10 ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-700' :
                    'bg-gray-300 border-gray-500 cursor-not-allowed'
                  }`}
                >
                  🏭 More Farms<br/>
                  Cost: {(farms * 10).toLocaleString()} cacti<br/>
                  Current: {farms}
                </button>

                <button 
                  onClick={upgradeSpeed}
                  disabled={cacti < cactiPerSecond * 20}
                  className={`font-bold py-3 px-4 rounded-lg pixelated border-4 ${
                    cacti >= cactiPerSecond * 20 ? 'bg-red-500 hover:bg-red-600 text-white border-red-700' :
                    'bg-gray-300 border-gray-500 cursor-not-allowed'
                  }`}
                >
                  ⚡ Faster Growth<br/>
                  Cost: {(cactiPerSecond * 20).toLocaleString()} cacti<br/>
                  Current: {cactiPerSecond}/sec
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Server Stats */}
            <div className="bg-gray-800 text-green-400 border-4 border-gray-600 rounded-lg p-6 pixelated">
              <h3 className="text-xl font-bold mb-4">📊 Server Stats</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Server Health:</span>
                    <span className={serverHealth < 30 ? 'text-red-400' : serverHealth < 70 ? 'text-yellow-400' : 'text-green-400'}>
                      {Math.round(serverHealth)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        serverHealth < 30 ? 'bg-red-500' : serverHealth < 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${serverHealth}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <span>Total Harvested: </span>
                  <span className="text-yellow-400">{totalCactiHarvested.toLocaleString()}</span>
                </div>

                <div>
                  <span>Lag Level: </span>
                  <span className={`${lagLevel > 5 ? 'text-red-400' : lagLevel > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {lagLevel} {isLagging ? '🔥' : ''}
                  </span>
                </div>

                <div>
                  <span>Farm Count: </span>
                  <span className="text-blue-400">{farms}</span>
                </div>
              </div>
            </div>

            {/* Discord Chat Simulator */}
            <div className="bg-gray-800 text-white border-4 border-gray-600 rounded-lg p-4 pixelated">
              <h3 className="text-lg font-bold mb-3">💬 Discord #general</h3>
              
              <div className="h-64 overflow-y-auto space-y-2 text-sm">
                {blameMessages.map((message) => (
                  <div key={message.id} className="bg-gray-700 p-2 rounded animate-fade-in">
                    <span className="text-gray-400 text-xs">{message.timestamp}</span>
                    <p className="text-white">{message.text}</p>
                  </div>
                ))}
                
                {blameMessages.length === 0 && (
                  <div className="text-gray-500 italic text-center mt-8">
                    Chat is quiet... for now...
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Button */}
            <button 
              onClick={emergencyTearDown}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg pixelated text-lg border-4 border-red-800 animate-pulse"
            >
              🚨 EMERGENCY TEARDOWN 🚨<br/>
              <span className="text-sm">Just like the real incident!</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-green-700 pixelated">
          <p className="text-lg">
            "It's always the cactus farm, isn't it?" - The Discord Community
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;