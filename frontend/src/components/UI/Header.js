import React from "react";

export const Header = ({
  source,
  tps,
  totalCactiHarvested,
  autoFarms,
  showInventory,
  setShowInventory,
  showShop,
  setShowShop,
}) => {
  // Toggle functions instead of just setting to true
  const toggleInventory = () => {
    setShowInventory((prev) => !prev);
    // Close shop if inventory is opening
    if (!showInventory && showShop) {
      setShowShop(false);
    }
  };

  const toggleShop = () => {
    setShowShop((prev) => !prev);
    // Close inventory if shop is opening
    if (!showShop && showInventory) {
      setShowInventory(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-800 to-red-800 text-white p-4 shadow-lg z-50">
      <div className="flex justify-between items-center">
        {/* Left side - Game stats */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌵</span>
            <div>
              <div className="font-bold text-lg">Blame the Cactus</div>
              <div className="text-xs opacity-80">Desert Farming Simulator</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-black bg-opacity-30 px-3 py-1 rounded">
              <span className="text-yellow-300">💰</span>{" "}
              {source.toLocaleString()} Source
            </div>
            <div className="bg-black bg-opacity-30 px-3 py-1 rounded">
              <span className="text-green-300">⚡</span> {tps} TPS
            </div>
            <div className="bg-black bg-opacity-30 px-3 py-1 rounded">
              <span className="text-purple-300">🌵</span>{" "}
              {totalCactiHarvested.toLocaleString()} Harvested
            </div>
            <div className="bg-black bg-opacity-30 px-3 py-1 rounded">
              <span className="text-blue-300">🏭</span> {autoFarms.length} Auto
              Farms
            </div>
          </div>
        </div>

        {/* Right side - UI buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleInventory}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showInventory
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            }`}
          >
            🎒 Inventory
          </button>
          <button
            onClick={toggleShop}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showShop
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            }`}
          >
            🛒 Shop
          </button>
        </div>
      </div>
    </header>
  );
};
