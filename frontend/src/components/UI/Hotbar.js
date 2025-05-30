import React from "react";

export const Hotbar = ({
  hotbar,
  selectedHotbarSlot,
  setSelectedHotbarSlot,
  hotbarRef,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
}) => {
  return (
    <div
      ref={hotbarRef}
      className="hotbar-container fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      style={{ userSelect: "none" }}
    >
      <div className="flex space-x-1 bg-gray-800 p-2 rounded-lg">
        {hotbar.map((item, index) => (
          <div
            key={index}
            className={`w-14 h-14 border-2 rounded cursor-pointer flex items-center justify-center text-lg relative ${
              selectedHotbarSlot === index
                ? "border-yellow-400 bg-yellow-900"
                : "border-gray-600 bg-gray-700"
            }`}
            onClick={() => setSelectedHotbarSlot(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "hotbar", index)}
          >
            <span className="absolute -top-2 -left-1 text-xs text-gray-400">
              {index + 1}
            </span>
            {item && (
              <div
                className="relative"
                draggable
                onDragStart={(e) => handleDragStart(e, item, "hotbar", index)}
                onDragEnd={handleDragEnd}
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
        Use arrow keys to scroll • 1-5 keys for hotbar • Drag items to organize
      </div>
    </div>
  );
};
