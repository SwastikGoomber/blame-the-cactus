import React from "react";
import { CONFIG } from "../../config/gameConfig";

export const Shop = ({
  showShop,
  setShowShop,
  source,
  purchaseItem,
  shopRef,
}) => {
  if (!showShop) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={shopRef}
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold pixelated">🛒 Shop</h2>
          <button
            onClick={() => setShowShop(false)}
            className="text-2xl hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Seeds */}
          <div>
            <h3 className="text-lg font-bold mb-2 pixelated">🌰 Seeds</h3>
            {CONFIG.items.seeds.map((item) => (
              <button
                key={item.id}
                onClick={() => purchaseItem(item)}
                disabled={source < item.cost}
                className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                  source >= item.cost
                    ? "bg-green-100 border-green-400 hover:bg-green-200"
                    : "bg-gray-100 border-gray-400"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{item.icon}</span>
                  <div className="text-left">
                    <div className="font-bold">5x {item.name}</div>
                    <div className="text-xs">💰 {item.cost} Source</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Wands */}
          <div>
            <h3 className="text-lg font-bold mb-2 pixelated">🪄 Wands</h3>
            {CONFIG.items.wands
              .filter((w) => w.cost > 0)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => purchaseItem(item)}
                  disabled={source < item.cost}
                  className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                    source >= item.cost
                      ? "bg-purple-100 border-purple-400 hover:bg-purple-200"
                      : "bg-gray-100 border-gray-400"
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
            {CONFIG.items.hoes
              .filter((h) => h.cost > 0)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => purchaseItem(item)}
                  disabled={source < item.cost}
                  className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                    source >= item.cost
                      ? "bg-brown-100 border-brown-400 hover:bg-brown-200"
                      : "bg-gray-100 border-gray-400"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{item.icon}</span>
                    <div className="text-left">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs">
                        Harvest: {item.harvestPower}x
                      </div>
                      <div className="text-xs">💰 {item.cost} Source</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          {/* Auto Farms */}
          <div>
            <h3 className="text-lg font-bold mb-2 pixelated">🏭 Auto Farms</h3>
            {CONFIG.farmTypes.map((farmType) => (
              <button
                key={farmType.id}
                onClick={() =>
                  purchaseItem({
                    ...farmType,
                    type: "farm",
                    id: farmType.id,
                    name: farmType.name,
                    icon: farmType.icon,
                    cost: farmType.cost,
                    minigame: farmType.minigame,
                  })
                }
                disabled={source < farmType.cost}
                className={`w-full mb-2 p-3 rounded border-2 text-sm ${
                  source >= farmType.cost
                    ? "bg-blue-100 border-blue-400 hover:bg-blue-200"
                    : "bg-gray-100 border-gray-400"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{farmType.icon}</span>
                  <div className="text-left">
                    <div className="font-bold">{farmType.name}</div>
                    <div className="text-xs">
                      Production: {farmType.production}/tick
                    </div>
                    <div className="text-xs">💰 {farmType.cost} Source</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
