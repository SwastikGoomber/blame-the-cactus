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
      className="flex space-x-2 bg-black bg-opacity-60 p-3 rounded-lg border-2 border-gray-600 shadow-lg"
    >
      {hotbar.map((item, index) => (
        <div
          key={index}
          className={`w-16 h-16 border-2 rounded-lg cursor-pointer transition-all duration-200 relative flex items-center justify-center ${
            selectedHotbarSlot === index
              ? "border-yellow-400 bg-yellow-900 bg-opacity-30"
              : "border-gray-500 bg-gray-800 hover:border-gray-400"
          }`}
          onClick={() => setSelectedHotbarSlot(index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "hotbar", index)}
        >
          {/* Slot number */}
          <div className="absolute -top-2 -left-2 bg-gray-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </div>

          {/* Item */}
          {item && (
            <div
              className="w-full h-full flex flex-col items-center justify-center relative"
              draggable
              onDragStart={(e) => handleDragStart(e, item, "hotbar", index)}
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
                <div className="absolute bottom-0 right-0 bg-yellow-600 text-white text-xs px-1 rounded-tl font-bold">
                  {item.quantity}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
