import React from "react";

export const Inventory = ({
  showInventory,
  setShowInventory,
  inventory,
  inventoryRef,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
}) => {
  if (!showInventory) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div
        ref={inventoryRef}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold pixelated">🎒 Inventory</h2>
          <button
            onClick={() => setShowInventory(false)}
            className="text-2xl hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 24 }, (_, index) => {
            const item = inventory[index];
            return (
              <div
                key={index}
                className="w-16 h-16 border-2 border-gray-400 rounded bg-gray-100 flex items-center justify-center relative cursor-pointer hover:bg-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "inventory", index)}
              >
                {item && (
                  <div
                    className="relative"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, item, "inventory", index)
                    }
                    onDragEnd={handleDragEnd}
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
  );
};
