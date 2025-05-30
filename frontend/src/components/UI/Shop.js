import React, { useState } from "react";
import { CONFIG } from "../../config/gameConfig";

export const Shop = ({
  showShop,
  setShowShop,
  source,
  purchaseItem,
  shopRef,
}) => {
  const [activeCategory, setActiveCategory] = useState("seeds");

  if (!showShop) return null;

  const categories = [
    { id: "seeds", name: "Seeds", icon: "🌱" },
    { id: "wands", name: "Wands", icon: "🪄" },
    { id: "hoes", name: "Hoes", icon: "🔨" },
    { id: "farms", name: "Farms", icon: "🏭" },
  ];

  const getCurrentItems = () => {
    return CONFIG.items[activeCategory] || [];
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div
          ref={shopRef}
          className="bg-gradient-to-b from-green-800 to-green-900 p-6 rounded-xl shadow-2xl border-4 border-yellow-600 max-w-4xl w-full mx-4"
          style={{ maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white pixelated">
                🛒 Desert Shop
              </h2>
              <p className="text-green-200 text-sm">
                Your source: 💰 {source.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowShop(false)}
              className="text-white hover:text-red-400 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? "bg-yellow-600 text-white shadow-lg"
                    : "bg-green-600 hover:bg-green-500 text-white"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Items Grid with Custom Scrollbar */}
          <div
            className="shop-scrollbar bg-black bg-opacity-30 rounded-lg p-4"
            style={{
              height: "400px",
              overflowY: "auto",
              paddingRight: "12px", // Space for scrollbar
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getCurrentItems().map((item) => {
                const canAfford = source >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      canAfford
                        ? "bg-green-700 border-green-500 hover:bg-green-600 hover:border-yellow-400"
                        : "bg-gray-700 border-gray-500 opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => canAfford && purchaseItem(item)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2 flex items-center justify-center">
                        {item.icon.startsWith("/assets/") ? (
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span>{item.icon}</span>
                        )}
                      </div>
                      <div className="text-white font-bold text-sm mb-1">
                        {item.name}
                      </div>
                      <div className="text-gray-300 text-xs mb-2">
                        {item.description}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          canAfford ? "text-yellow-300" : "text-red-400"
                        }`}
                      >
                        💰 {item.cost.toLocaleString()}
                      </div>
                      {item.id === "cactus_seed" && (
                        <div className="text-green-300 text-xs mt-1">
                          Comes in pack of 5!
                        </div>
                      )}
                      {item.type === "farm" && (
                        <div className="text-blue-300 text-xs mt-1">
                          Requires minigame!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-green-200 text-sm">
            Browse categories above • Click items to purchase • Drag from
            inventory to hotbar to use
          </div>
        </div>
      </div>

      {/* Global Custom Scrollbar Styles */}
      <style jsx global>{`
        .shop-scrollbar::-webkit-scrollbar {
          width: 14px;
        }

        .shop-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 8px;
          margin: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .shop-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            #fbbf24 0%,
            #f59e0b 50%,
            #d97706 100%
          );
          border-radius: 8px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .shop-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            #f59e0b 0%,
            #d97706 50%,
            #b45309 100%
          );
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .shop-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(
            180deg,
            #d97706 0%,
            #b45309 50%,
            #92400e 100%
          );
        }

        .shop-scrollbar::-webkit-scrollbar-corner {
          background: rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </>
  );
};
