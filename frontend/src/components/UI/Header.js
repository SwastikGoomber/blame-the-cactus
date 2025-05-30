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
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-3 z-30 h-16">
      <div className="flex justify-between items-center pixelated">
        <div className="flex space-x-6 text-sm">
          <span>💰 Source: {Math.floor(source)}</span>
          <span
            className={`${
              tps < 10
                ? "text-red-400"
                : tps < 15
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            ⚡ TPS: {tps.toFixed(1)}/20
          </span>
          <span>🌵 Harvested: {totalCactiHarvested}</span>
          <span>🏭 Auto Farms: {autoFarms.length}</span>
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
  );
};
