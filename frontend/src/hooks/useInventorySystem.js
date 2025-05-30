import { useState, useEffect, useRef } from "react";
import { CONFIG } from "../config/gameConfig";

export const useInventorySystem = () => {
  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [hotbar, setHotbar] = useState(() => {
    const initialHotbar = Array(CONFIG.inventory.hotbarSize).fill(null);
    initialHotbar[0] = { ...CONFIG.items.seeds[0], quantity: 10 };
    initialHotbar[1] = { ...CONFIG.items.wands[0], quantity: 1 };
    initialHotbar[2] = { ...CONFIG.items.hoes[0], quantity: 1 };
    return initialHotbar;
  });
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);

  // Refs
  const inventoryRef = useRef(null);
  const shopRef = useRef(null);
  const hotbarRef = useRef(null);

  // Drag and Drop System
  const handleDragStart = (event, item, sourceType, sourceIndex) => {
    event.stopPropagation();
    setDraggedItem({ item, sourceType, sourceIndex });
    setDragSource({ type: sourceType, index: sourceIndex });

    // Create a proper drag image with item icon (not asset path)
    const dragImage = document.createElement("div");
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.fontSize = "2rem";
    dragImage.style.background = "rgba(0, 0, 0, 0.8)";
    dragImage.style.color = "white";
    dragImage.style.padding = "8px";
    dragImage.style.borderRadius = "8px";
    dragImage.style.border = "2px solid #fff";
    dragImage.innerHTML = item.icon || "📦"; // Use icon instead of name
    document.body.appendChild(dragImage);

    event.dataTransfer.setDragImage(dragImage, 25, 25);
    event.dataTransfer.effectAllowed = "move";

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = (event) => {
    event.stopPropagation();
    setDraggedItem(null);
    setDragSource(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
  };

  // Enhanced drag and drop with item stacking
  const handleDrop = (event, targetType, targetIndex = null) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedItem) return;

    const { item, sourceType, sourceIndex } = draggedItem;

    // Prevent dropping on the same slot
    if (sourceType === targetType && sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDragSource(null);
      return;
    }

    if (targetType === "hotbar" && targetIndex !== null) {
      const currentHotbarItem = hotbar[targetIndex];

      if (sourceType === "inventory") {
        // Check if items can stack
        if (currentHotbarItem && currentHotbarItem.id === item.id) {
          // Stack items
          setHotbar((prev) => {
            const newHotbar = [...prev];
            newHotbar[targetIndex] = {
              ...currentHotbarItem,
              quantity: currentHotbarItem.quantity + item.quantity,
            };
            return newHotbar;
          });

          // Remove from inventory
          setInventory((prev) =>
            prev.filter((_, index) => index !== sourceIndex)
          );
        } else {
          // Different items or empty slot - move/swap
          setHotbar((prev) => {
            const newHotbar = [...prev];
            newHotbar[targetIndex] = item;
            return newHotbar;
          });

          // Remove from inventory
          setInventory((prev) =>
            prev.filter((_, index) => index !== sourceIndex)
          );

          // If hotbar slot had an item, move it to inventory
          if (currentHotbarItem) {
            setInventory((prev) => [...prev, currentHotbarItem]);
          }
        }
      } else if (sourceType === "hotbar") {
        // Check if items can stack
        if (currentHotbarItem && currentHotbarItem.id === item.id) {
          // Stack items
          setHotbar((prev) => {
            const newHotbar = [...prev];
            newHotbar[targetIndex] = {
              ...currentHotbarItem,
              quantity: currentHotbarItem.quantity + item.quantity,
            };
            newHotbar[sourceIndex] = null;
            return newHotbar;
          });
        } else {
          // Different items - swap
          setHotbar((prev) => {
            const newHotbar = [...prev];
            newHotbar[sourceIndex] = currentHotbarItem;
            newHotbar[targetIndex] = item;
            return newHotbar;
          });
        }
      }
    } else if (targetType === "inventory") {
      if (sourceType === "hotbar") {
        // Check if we can stack with existing inventory item
        const existingItemIndex = inventory.findIndex(
          (invItem) => invItem && invItem.id === item.id
        );

        if (existingItemIndex !== -1) {
          // Stack with existing item
          setInventory((prev) =>
            prev.map((invItem, index) =>
              index === existingItemIndex
                ? { ...invItem, quantity: invItem.quantity + item.quantity }
                : invItem
            )
          );
        } else {
          // Add new item to inventory
          setInventory((prev) => [...prev, item]);
        }

        // Remove from hotbar
        setHotbar((prev) => {
          const newHotbar = [...prev];
          newHotbar[sourceIndex] = null;
          return newHotbar;
        });
      } else if (sourceType === "inventory" && targetIndex !== null) {
        const targetItem = inventory[targetIndex];

        // Check if items can stack
        if (targetItem && targetItem.id === item.id) {
          // Stack items
          setInventory((prev) => {
            const newInventory = [...prev];
            newInventory[targetIndex] = {
              ...targetItem,
              quantity: targetItem.quantity + item.quantity,
            };
            // Remove source item
            newInventory.splice(sourceIndex, 1);
            return newInventory;
          });
        } else {
          // Different items - swap positions
          setInventory((prev) => {
            const newInventory = [...prev];
            newInventory[sourceIndex] = targetItem;
            newInventory[targetIndex] = item;
            return newInventory;
          });
        }
      }
    }

    setDraggedItem(null);
    setDragSource(null);
  };

  // Keyboard controls for hotbar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "1" && e.key <= "7") {
        setSelectedHotbarSlot(parseInt(e.key) - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    // State
    inventory,
    setInventory,
    hotbar,
    setHotbar,
    selectedHotbarSlot,
    setSelectedHotbarSlot,
    draggedItem,
    setDraggedItem,
    dragSource,
    setDragSource,

    // Refs
    inventoryRef,
    shopRef,
    hotbarRef,

    // Functions
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
};
