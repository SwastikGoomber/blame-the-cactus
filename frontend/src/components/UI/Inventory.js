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

  // Extended inventory grid: 8 columns x 6 rows = 48 slots
  const inventorySlots = Array(48).fill(null);

  // Fill inventory slots with items
  inventory.forEach((item, index) => {
    if (index < 48) {
      inventorySlots[index] = item;
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div
        ref={inventoryRef}
        className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl border-4 border-yellow-600 max-w-2xl w-full mx-4"
        style={{ maxHeight: "80vh" }} // Ensure it fits on screen
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white pixelated">
            🎒 Inventory
          </h2>
          <button
            onClick={() => setShowInventory(false)}
            className="text-white hover:text-red-400 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Inventory Grid - 8x6 with no overflow */}
        <div
          className="grid grid-cols-8 gap-2 p-4 bg-black bg-opacity-30 rounded-lg"
          style={{ height: "400px" }} // Fixed height to prevent scrolling
        >
          {inventorySlots.map((item, index) => (
            <div
              key={index}
              className="w-16 h-16 bg-gray-700 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all relative group"
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, "inventory", index)}
            >
              {item && (
                <div
                  className="w-full h-full flex flex-col items-center justify-center relative"
                  draggable
                  onDragStart={(event) =>
                    handleDragStart(event, item, "inventory", index)
                  }
                  onDragEnd={handleDragEnd}
                >
                  <div className="text-2xl flex items-center justify-center">
                    {item.icon && item.icon.startsWith("/assets/") ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span>{item.icon || "📦"}</span>
                    )}
                  </div>
                  {item.quantity > 1 && (
                    <span className="absolute -bottom-1 -right-1 bg-yellow-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-90 text-white text-xs p-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="font-bold">{item.name}</div>
                    {item.description && (
                      <div className="text-gray-300">{item.description}</div>
                    )}
                    {item.cost && (
                      <div className="text-yellow-300">💰 {item.cost}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          {inventory.length} / 48 slots used
        </div>
      </div>
    </div>
  );
};
