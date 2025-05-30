import { useRef, useEffect } from "react";
import { CONFIG } from "../config/gameConfig";

export const useFarmingLogic = (gameState, inventorySystem) => {
  const gameWorldRef = useRef(null);

  // Get cactus asset based on growth stage
  const getCactusAsset = (growth) => {
    if (growth < 50) return CONFIG.assets.cactus.stage1;
    if (growth < 100) return CONFIG.assets.cactus.stage2;
    return CONFIG.assets.cactus.stage3;
  };

  // Calculate cactus positioning
  const getCactusStyle = (growth) => {
    const scale = Math.max(0.3, growth / 100);
    return {
      width: `${60 * scale}px`,
      height: "auto",
      imageRendering: "pixelated",
      transform: `scale(${scale})`,
      transformOrigin: "bottom center",
    };
  };

  // Get block coordinate from world X position
  const getBlockX = (worldX) => {
    return Math.floor(worldX / CONFIG.world.blockSize);
  };

  // Get world X position from block coordinate
  const getWorldX = (blockX) => {
    return blockX * CONFIG.world.blockSize;
  };

  // Purchase item
  const purchaseItem = (item) => {
    if (gameState.source >= item.cost) {
      gameState.setSource((prev) => prev - item.cost);
      inventorySystem.setInventory((prev) => {
        const existing = prev.find((i) => i && i.id === item.id);
        const quantityToAdd = item.id === "cactus_seed" ? 5 : 1;

        if (existing) {
          return prev.map((i) =>
            i && i.id === item.id
              ? { ...i, quantity: i.quantity + quantityToAdd }
              : i
          );
        } else {
          return [...prev, { ...item, quantity: quantityToAdd }];
        }
      });
      const itemName =
        item.id === "cactus_seed" ? `5x ${item.name}` : item.name;
      gameState.addNotification(`Purchased ${itemName}!`, "purchase", 2000);

      if (item.type === "farm") {
        gameState.addNotification(
          "Drag farm to hotbar and place it in the world!",
          "info",
          3000
        );
      }
    }
  };

  // Generic function to handle item usage on a block
  const useItemOnBlock = (
    item,
    blockX,
    sourceType = "hotbar",
    sourceIndex = null
  ) => {
    const block = gameState.farmingBlocks[blockX];
    if (!block) return false;

    // Handle farm placement with minigame
    if (item.type === "farm" && !block.occupied) {
      const farmType = CONFIG.farmTypes.find((ft) => ft.id === item.id);
      if (farmType) {
        gameState.setFarmPlacement({
          farmItem: item,
          blockX: blockX,
          sourceType: sourceType,
          sourceIndex: sourceIndex,
        });

        gameState.setActiveMinigame({
          type: farmType.minigame,
          farmType: farmType,
          placement: true,
        });

        gameState.addNotification(
          "🎮 Complete the minigame to place your farm!",
          "info",
          2000
        );
        return true;
      }
      return false;
    }

    // Handle planting seeds
    if (item.id === "cactus_seed" && !block.occupied) {
      const newCrop = {
        id: Date.now(),
        blockX: blockX,
        growth: 0,
        maxGrowth: 100,
        type: "cactus",
      };

      gameState.setManualCrops((prev) => [...prev, newCrop]);
      gameState.setFarmingBlocks((prev) => ({
        ...prev,
        [blockX]: { ...block, occupied: true, crop: newCrop.id },
      }));

      // Consume seed from appropriate source
      if (sourceType === "hotbar") {
        inventorySystem.setHotbar((prev) => {
          const newHotbar = [...prev];
          const slotIndex =
            sourceIndex !== null
              ? sourceIndex
              : inventorySystem.selectedHotbarSlot;
          if (newHotbar[slotIndex] && newHotbar[slotIndex].quantity > 1) {
            newHotbar[slotIndex] = {
              ...newHotbar[slotIndex],
              quantity: newHotbar[slotIndex].quantity - 1,
            };
          } else {
            newHotbar[slotIndex] = null;
          }
          return newHotbar;
        });
      } else if (sourceType === "inventory" && sourceIndex !== null) {
        inventorySystem.setInventory((prev) => {
          const newInventory = [...prev];
          if (
            newInventory[sourceIndex] &&
            newInventory[sourceIndex].quantity > 1
          ) {
            newInventory[sourceIndex] = {
              ...newInventory[sourceIndex],
              quantity: newInventory[sourceIndex].quantity - 1,
            };
          } else {
            newInventory.splice(sourceIndex, 1);
          }
          return newInventory;
        });
      }

      gameState.addNotification("🌱 Cactus planted!", "plant", 1500);
      return true;

      // Handle growing crops with wand
    } else if (item.growthPower && block.crop) {
      const crop = gameState.manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth < 100) {
        const growthIncrease = item.growthPower * 15;
        gameState.setManualCrops((prev) =>
          prev.map((c) =>
            c.id === crop.id
              ? { ...c, growth: Math.min(100, c.growth + growthIncrease) }
              : c
          )
        );
        gameState.addNotification(`+${growthIncrease}% growth`, "growth", 1000);
        return true;
      } else if (crop && crop.growth >= 100) {
        gameState.addNotification(
          "🌵 Use a hoe to harvest this cactus!",
          "warning",
          1500
        );
        return false;
      }

      // Handle harvesting with hoe
    } else if (item.harvestPower && block.crop) {
      const crop = gameState.manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth >= 100) {
        const sourceGained = CONFIG.source.basePerCactus * item.harvestPower;
        gameState.setSource((prev) => prev + sourceGained);
        gameState.setTotalCactiHarvested((prev) => prev + 1);

        gameState.setManualCrops((prev) =>
          prev.filter((c) => c.id !== crop.id)
        );
        gameState.setFarmingBlocks((prev) => ({
          ...prev,
          [blockX]: { ...block, occupied: false, crop: null },
        }));

        gameState.addNotification(`+${sourceGained} Source`, "source", 1500);
        return true;
      } else if (crop && crop.growth < 100) {
        gameState.addNotification(
          "🌱 This cactus isn't ready to harvest yet!",
          "warning",
          1500
        );
        return false;
      }
    } else if (item.id === "cactus_seed" && block.occupied) {
      gameState.addNotification(
        "⚠️ This block is already occupied!",
        "warning",
        1500
      );
      return false;
    } else if (item.type === "farm" && block.occupied) {
      gameState.addNotification(
        "⚠️ This block is already occupied!",
        "warning",
        1500
      );
      return false;
    }

    return false;
  };

  // Handle world click for farming
  const handleWorldClick = (event) => {
    if (
      gameState.showInventory ||
      gameState.showShop ||
      gameState.activeMinigame
    ) {
      return;
    }

    const rect = gameWorldRef.current.getBoundingClientRect();
    const worldX = event.clientX - rect.left + gameState.scrollPosition;
    const worldY = event.clientY - rect.top;

    if (worldY < 0 || worldY > 120) {
      return;
    }

    if (worldX < 0 || worldX > CONFIG.world.width) {
      gameState.addNotification(
        "⚠️ You can only farm in designated areas!",
        "warning",
        2000
      );
      return;
    }

    const blockX = getBlockX(worldX);
    const selectedItem =
      inventorySystem.hotbar[inventorySystem.selectedHotbarSlot];

    if (!selectedItem) {
      gameState.addNotification(
        "⚠️ Select a tool or seed first!",
        "warning",
        1500
      );
      return;
    }

    useItemOnBlock(selectedItem, blockX);
  };

  // Handle farming block click
  const handleFarmingBlockClick = (blockX, event) => {
    event.stopPropagation();

    if (gameState.showInventory || gameState.showShop) return;

    const selectedItem =
      inventorySystem.hotbar[inventorySystem.selectedHotbarSlot];
    if (!selectedItem) {
      gameState.addNotification(
        "⚠️ Select a tool or seed first!",
        "warning",
        1500
      );
      return;
    }

    useItemOnBlock(selectedItem, blockX);
  };

  // Handle drag and drop on farming blocks
  const handleFarmingBlockDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (inventorySystem.draggedItem) {
      event.dataTransfer.dropEffect = "move";
    }
  };

  const handleFarmingBlockDrop = (event, blockX) => {
    event.preventDefault();
    event.stopPropagation();

    if (!inventorySystem.draggedItem) return;

    const { item, sourceType, sourceIndex } = inventorySystem.draggedItem;
    useItemOnBlock(item, blockX, sourceType, sourceIndex);

    inventorySystem.setDraggedItem(null);
    inventorySystem.setDragSource(null);
  };

  // Complete minigame and handle result
  const handleMinigameComplete = (success) => {
    if (
      success &&
      gameState.activeMinigame?.placement &&
      gameState.farmPlacement
    ) {
      const newFarm = {
        id: Date.now(),
        type: gameState.activeMinigame.farmType.id,
        position: { x: getWorldX(gameState.farmPlacement.blockX) + 40, y: 20 },
        upgrades: { multiplier: 1 },
      };

      gameState.setAutoFarms((prev) => [...prev, newFarm]);

      gameState.setFarmingBlocks((prev) => ({
        ...prev,
        [gameState.farmPlacement.blockX]: {
          ...prev[gameState.farmPlacement.blockX],
          occupied: true,
          farm: newFarm.id,
        },
      }));

      // Consume farm item
      if (gameState.farmPlacement.sourceType === "hotbar") {
        const slotIndex =
          gameState.farmPlacement.sourceIndex !== null
            ? gameState.farmPlacement.sourceIndex
            : inventorySystem.selectedHotbarSlot;
        inventorySystem.setHotbar((prev) => {
          const newHotbar = [...prev];
          if (newHotbar[slotIndex] && newHotbar[slotIndex].quantity > 1) {
            newHotbar[slotIndex] = {
              ...newHotbar[slotIndex],
              quantity: newHotbar[slotIndex].quantity - 1,
            };
          } else {
            newHotbar[slotIndex] = null;
          }
          return newHotbar;
        });
      } else if (
        gameState.farmPlacement.sourceType === "inventory" &&
        gameState.farmPlacement.sourceIndex !== null
      ) {
        inventorySystem.setInventory((prev) => {
          const newInventory = [...prev];
          if (
            newInventory[gameState.farmPlacement.sourceIndex] &&
            newInventory[gameState.farmPlacement.sourceIndex].quantity > 1
          ) {
            newInventory[gameState.farmPlacement.sourceIndex] = {
              ...newInventory[gameState.farmPlacement.sourceIndex],
              quantity:
                newInventory[gameState.farmPlacement.sourceIndex].quantity - 1,
            };
          } else {
            newInventory.splice(gameState.farmPlacement.sourceIndex, 1);
          }
          return newInventory;
        });
      }

      gameState.addNotification(
        `🏭 ${gameState.activeMinigame.farmType.name} placed successfully!`,
        "farm",
        3000
      );
    } else if (success) {
      gameState.addNotification(
        "✅ Minigame completed successfully!",
        "farm",
        2000
      );
    } else {
      gameState.addNotification(
        "❌ Minigame failed! Farm not placed.",
        "warning",
        2000
      );
    }

    gameState.setActiveMinigame(null);
    gameState.setFarmPlacement(null);
  };

  // Handle sprinkler minigame failure
  const handleSprinklerFailure = (message) => {
    gameState.setFailurePopup(message);
    setTimeout(() => {
      gameState.setFailurePopup(null);
      gameState.setActiveMinigame(null);
      gameState.setFarmPlacement(null);
    }, 3000);
  };

  // Click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOnHotbar =
        inventorySystem.hotbarRef.current &&
        inventorySystem.hotbarRef.current.contains(event.target);

      if (
        gameState.showInventory &&
        inventorySystem.inventoryRef.current &&
        !inventorySystem.inventoryRef.current.contains(event.target) &&
        !isClickOnHotbar
      ) {
        gameState.setShowInventory(false);
      }
      if (
        gameState.showShop &&
        inventorySystem.shopRef.current &&
        !inventorySystem.shopRef.current.contains(event.target)
      ) {
        gameState.setShowShop(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [gameState.showInventory, gameState.showShop]);

  return {
    // Refs
    gameWorldRef,

    // Functions
    getCactusAsset,
    getCactusStyle,
    getBlockX,
    getWorldX,
    purchaseItem,
    useItemOnBlock,
    handleWorldClick,
    handleFarmingBlockClick,
    handleFarmingBlockDragOver,
    handleFarmingBlockDrop,
    handleMinigameComplete,
    handleSprinklerFailure,
  };
};
