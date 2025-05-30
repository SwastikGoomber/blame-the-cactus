import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { CONFIG } from "./config/gameConfig";
import {
  ModApprovalMinigame,
  CactusLotteryMinigame,
  CountCactusMinigame,
  TechCalibrationMinigame,
  SprinklerPuzzleMinigame,
} from "./components/Minigames";
import { Header } from "./components/UI/Header";
import { Shop } from "./components/UI/Shop";
import { Inventory } from "./components/UI/Inventory";
import { Hotbar } from "./components/UI/Hotbar";
import { Notifications } from "./components/UI/Notifications";

function App() {
  // Game State
  const [source, setSource] = useState(100);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tps, setTPS] = useState(20);
  const [totalCactiHarvested, setTotalCactiHarvested] = useState(0);
  const [blameCount, setBlameCount] = useState(0);

  // Inventory System
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

  // World State
  const [farmingBlocks, setFarmingBlocks] = useState(() => {
    const blocks = {};
    const startBlock = Math.floor(
      CONFIG.world.farmingAreaStart / CONFIG.world.blockSize
    );
    const endBlock = Math.floor(
      CONFIG.world.farmingAreaEnd / CONFIG.world.blockSize
    );

    for (let x = startBlock; x < endBlock; x++) {
      blocks[x] = {
        x,
        occupied: false,
        crop: null,
        farm: null,
      };
    }
    return blocks;
  });

  const [autoFarms, setAutoFarms] = useState([]);
  const [manualCrops, setManualCrops] = useState([]);

  // UI State
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [npcAnimation, setNpcAnimation] = useState(null);
  const [farmPlacement, setFarmPlacement] = useState(null);
  const [failurePopup, setFailurePopup] = useState(null);

  // Refs
  const gameWorldRef = useRef(null);
  const inventoryRef = useRef(null);
  const shopRef = useRef(null);
  const hotbarRef = useRef(null);
  const keysRef = useRef({});

  // Layout calculations
  const getLayoutPositions = () => {
    const viewportHeight = window.innerHeight;
    const headerHeight = 64;
    const hotbarHeight = 100;
    const gameHeight = viewportHeight - headerHeight - hotbarHeight;

    return {
      skyTop: headerHeight,
      skyHeight: gameHeight * (CONFIG.world.layout.skyHeight / 100),
      farmingTop:
        headerHeight + gameHeight * (CONFIG.world.layout.skyHeight / 100),
      farmingHeight: gameHeight * (CONFIG.world.layout.farmingHeight / 100),
      groundTop:
        headerHeight +
        gameHeight *
          ((CONFIG.world.layout.skyHeight + CONFIG.world.layout.farmingHeight) /
            100),
      groundHeight: gameHeight * (CONFIG.world.layout.groundHeight / 100),
    };
  };

  // Notification system
  const addNotification = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now() + Math.random();
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    },
    []
  );

  // Purchase item - Updated to handle farms as items
  const purchaseItem = (item) => {
    if (source >= item.cost) {
      setSource((prev) => prev - item.cost);
      setInventory((prev) => {
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
      addNotification(`Purchased ${itemName}!`, "purchase", 2000);

      // If it's a farm, add instruction
      if (item.type === "farm") {
        addNotification(
          "Drag farm to hotbar and place it in the world!",
          "info",
          3000
        );
      }
    }
  };

  // Get block coordinate from world X position
  const getBlockX = (worldX) => {
    return Math.floor(worldX / CONFIG.world.blockSize);
  };

  // Get world X position from block coordinate
  const getWorldX = (blockX) => {
    return blockX * CONFIG.world.blockSize;
  };

  // Generic function to handle item usage on a block (for both click and drag)
  const useItemOnBlock = (
    item,
    blockX,
    sourceType = "hotbar",
    sourceIndex = null
  ) => {
    const block = farmingBlocks[blockX];
    if (!block) return false;

    // Handle farm placement with minigame
    if (item.type === "farm" && !block.occupied) {
      console.log("Using farm - trigger minigame!");

      const farmType = CONFIG.farmTypes.find((ft) => ft.id === item.id);
      if (farmType) {
        setFarmPlacement({
          farmItem: item,
          blockX: blockX,
          sourceType: sourceType,
          sourceIndex: sourceIndex,
        });

        setActiveMinigame({
          type: farmType.minigame,
          farmType: farmType,
          placement: true,
        });

        addNotification(
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
      console.log("Planting seed!");

      const newCrop = {
        id: Date.now(),
        blockX: blockX,
        growth: 0,
        maxGrowth: 100,
        type: "cactus",
      };

      setManualCrops((prev) => [...prev, newCrop]);
      setFarmingBlocks((prev) => ({
        ...prev,
        [blockX]: { ...block, occupied: true, crop: newCrop.id },
      }));

      // Consume seed from appropriate source
      if (sourceType === "hotbar") {
        setHotbar((prev) => {
          const newHotbar = [...prev];
          const slotIndex =
            sourceIndex !== null ? sourceIndex : selectedHotbarSlot;
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
        setInventory((prev) => {
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

      addNotification("🌱 Cactus planted!", "plant", 1500);
      return true;

      // Handle growing crops with wand
    } else if (item.growthPower && block.crop) {
      const crop = manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth < 100) {
        const growthIncrease = item.growthPower * 15;
        setManualCrops((prev) =>
          prev.map((c) =>
            c.id === crop.id
              ? { ...c, growth: Math.min(100, c.growth + growthIncrease) }
              : c
          )
        );
        addNotification(`+${growthIncrease}% growth`, "growth", 1000);
        return true;
      } else if (crop && crop.growth >= 100) {
        addNotification(
          "🌵 Use a hoe to harvest this cactus!",
          "warning",
          1500
        );
        return false;
      }

      // Handle harvesting with hoe
    } else if (item.harvestPower && block.crop) {
      const crop = manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth >= 100) {
        const sourceGained = CONFIG.source.basePerCactus * item.harvestPower;
        setSource((prev) => prev + sourceGained);
        setTotalCactiHarvested((prev) => prev + 1);

        setManualCrops((prev) => prev.filter((c) => c.id !== crop.id));
        setFarmingBlocks((prev) => ({
          ...prev,
          [blockX]: { ...block, occupied: false, crop: null },
        }));

        addNotification(`+${sourceGained} Source`, "source", 1500);
        return true;
      } else if (crop && crop.growth < 100) {
        addNotification(
          "🌱 This cactus isn't ready to harvest yet!",
          "warning",
          1500
        );
        return false;
      }
    } else if (item.id === "cactus_seed" && block.occupied) {
      addNotification("⚠️ This block is already occupied!", "warning", 1500);
      return false;
    } else if (item.type === "farm" && block.occupied) {
      addNotification("⚠️ This block is already occupied!", "warning", 1500);
      return false;
    }

    return false;
  };

  // Handle world click for farming and farm placement
  const handleWorldClick = (event) => {
    console.log("World clicked!");

    // Prevent interaction if any modals are open
    if (showInventory || showShop || activeMinigame) {
      console.log("Modal open, blocking interaction");
      return;
    }

    const rect = gameWorldRef.current.getBoundingClientRect();
    const worldX = event.clientX - rect.left + scrollPosition;
    const worldY = event.clientY - rect.top;

    console.log("Click position:", { worldX, worldY });

    const layout = getLayoutPositions();

    // Adjust for the offset since farming layer is offset by -64px
    const adjustedFarmingTop = layout.farmingTop - 64;
    const adjustedFarmingBottom = adjustedFarmingTop + layout.farmingHeight;

    console.log("Farming bounds:", {
      adjustedFarmingTop,
      adjustedFarmingBottom,
    });

    if (worldY < adjustedFarmingTop || worldY > adjustedFarmingBottom) {
      console.log("Click outside farming area");
      return;
    }

    if (
      worldX < CONFIG.world.farmingAreaStart ||
      worldX > CONFIG.world.farmingAreaEnd
    ) {
      addNotification(
        "⚠️ You can only farm in designated areas!",
        "warning",
        2000
      );
      return;
    }

    const blockX = getBlockX(worldX);
    const selectedItem = hotbar[selectedHotbarSlot];

    if (!selectedItem) {
      addNotification("⚠️ Select a tool or seed first!", "warning", 1500);
      return;
    }

    useItemOnBlock(selectedItem, blockX);
  };

  // Handle farming block click
  const handleFarmingBlockClick = (blockX, event) => {
    event.stopPropagation();
    console.log("Farming block clicked!", blockX);

    if (showInventory || showShop) return;

    const selectedItem = hotbar[selectedHotbarSlot];
    if (!selectedItem) {
      addNotification("⚠️ Select a tool or seed first!", "warning", 1500);
      return;
    }

    useItemOnBlock(selectedItem, blockX);
  };

  // Handle drag and drop on farming blocks
  const handleFarmingBlockDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggedItem) {
      event.dataTransfer.dropEffect = "move";
    }
  };

  const handleFarmingBlockDrop = (event, blockX) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedItem) return;

    console.log("Item dropped on farming block:", blockX, draggedItem);

    const { item, sourceType, sourceIndex } = draggedItem;

    // Use the item on the block
    const success = useItemOnBlock(item, blockX, sourceType, sourceIndex);

    // Clear drag state
    setDraggedItem(null);
    setDragSource(null);
  };

  // Drag and Drop System
  const handleDragStart = (event, item, sourceType, sourceIndex) => {
    event.stopPropagation();
    setDraggedItem({ item, sourceType, sourceIndex });
    setDragSource({ type: sourceType, index: sourceIndex });

    // Create a transparent drag image
    const dragImage = document.createElement("div");
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.innerHTML = item.icon;
    dragImage.style.fontSize = "2rem";
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

  // Click outside to close modals (excluding hotbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on hotbar or its children
      const isClickOnHotbar =
        hotbarRef.current && hotbarRef.current.contains(event.target);

      if (
        showInventory &&
        inventoryRef.current &&
        !inventoryRef.current.contains(event.target) &&
        !isClickOnHotbar
      ) {
        setShowInventory(false);
      }
      if (
        showShop &&
        shopRef.current &&
        !shopRef.current.contains(event.target)
      ) {
        setShowShop(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInventory, showShop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;

      if (e.key >= "1" && e.key <= "5") {
        setSelectedHotbarSlot(parseInt(e.key) - 1);
      }

      if (e.key === "Escape") {
        setShowInventory(false);
        setShowShop(false);
        setFarmPlacement(null);
        setActiveMinigame(null);
        setFailurePopup(null);
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const scrollInterval = setInterval(() => {
      const scrollSpeed = 10;
      if (keysRef.current["ArrowLeft"]) {
        setScrollPosition((prev) => Math.max(0, prev - scrollSpeed));
      }
      if (keysRef.current["ArrowRight"]) {
        setScrollPosition((prev) =>
          Math.min(
            CONFIG.world.width - CONFIG.world.viewportWidth,
            prev + scrollSpeed
          )
        );
      }
    }, 16);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(scrollInterval);
    };
  }, []);

  // Auto farm production
  useEffect(() => {
    const interval = setInterval(() => {
      autoFarms.forEach((farm) => {
        const farmType = CONFIG.farmTypes.find((ft) => ft.id === farm.type);
        if (farmType) {
          const production =
            farmType.production * (farm.upgrades?.multiplier || 1);
          setSource((prev) => prev + production);
          setTotalCactiHarvested((prev) => prev + production);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoFarms]);

  // Random events
  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.005 && totalCactiHarvested > 20) {
        setNpcAnimation({
          type: "cultist",
          phase: "entering",
          direction: Math.random() < 0.5 ? "left" : "right",
          position: 0,
        });
        addNotification(
          "🌵 A mysterious cult approaches your farm... 🌵",
          "cultist",
          4000
        );
      }
    }, 1000);

    return () => clearInterval(eventInterval);
  }, [totalCactiHarvested, addNotification]);

  // Complete minigame and handle result
  const handleMinigameComplete = (success) => {
    if (success && activeMinigame?.placement && farmPlacement) {
      // Player won the minigame, place the farm
      const newFarm = {
        id: Date.now(),
        type: activeMinigame.farmType.id,
        position: { x: getWorldX(farmPlacement.blockX) + 40, y: 50 },
        upgrades: { multiplier: 1 },
      };

      setAutoFarms((prev) => [...prev, newFarm]);

      // Mark the block as occupied with the farm
      setFarmingBlocks((prev) => ({
        ...prev,
        [farmPlacement.blockX]: {
          ...prev[farmPlacement.blockX],
          occupied: true,
          farm: newFarm.id,
        },
      }));

      // Consume farm item from the appropriate source
      if (farmPlacement.sourceType === "hotbar") {
        const slotIndex =
          farmPlacement.sourceIndex !== null
            ? farmPlacement.sourceIndex
            : selectedHotbarSlot;
        setHotbar((prev) => {
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
        farmPlacement.sourceType === "inventory" &&
        farmPlacement.sourceIndex !== null
      ) {
        setInventory((prev) => {
          const newInventory = [...prev];
          if (
            newInventory[farmPlacement.sourceIndex] &&
            newInventory[farmPlacement.sourceIndex].quantity > 1
          ) {
            newInventory[farmPlacement.sourceIndex] = {
              ...newInventory[farmPlacement.sourceIndex],
              quantity: newInventory[farmPlacement.sourceIndex].quantity - 1,
            };
          } else {
            newInventory.splice(farmPlacement.sourceIndex, 1);
          }
          return newInventory;
        });
      }

      addNotification(
        `🏭 ${activeMinigame.farmType.name} placed successfully!`,
        "farm",
        3000
      );
    } else if (success) {
      addNotification("✅ Minigame completed successfully!", "farm", 2000);
    } else {
      addNotification("❌ Minigame failed! Farm not placed.", "warning", 2000);
    }

    setActiveMinigame(null);
    setFarmPlacement(null);
  };

  // Handle sprinkler minigame failure with external popup
  const handleSprinklerFailure = (message) => {
    setFailurePopup(message);
    setTimeout(() => {
      setFailurePopup(null);
      setActiveMinigame(null);
      setFarmPlacement(null);
    }, 3000);
  };

  const layout = getLayoutPositions();

  return (
    <div className="min-h-screen overflow-hidden no-select">
      {/* Notifications */}
      <Notifications notifications={notifications} />

      {/* External Failure Popup for Sprinkler Minigame */}
      {failurePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-red-500 text-white p-8 rounded-lg max-w-md mx-4 text-center animate-pulse border-4 border-red-300">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-bold mb-4 pixelated">
              MINIGAME FAILED!
            </h2>
            <p className="text-lg mb-4 pixelated">{failurePopup}</p>
            <p className="text-sm opacity-75">
              Press ESC or wait to continue...
            </p>
          </div>
        </div>
      )}

      {/* NPC Animation Overlay */}
      {npcAnimation && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div
            className="absolute transition-all duration-100"
            style={{
              left: `${npcAnimation.position}%`,
              bottom: "120px",
              transform:
                npcAnimation.direction === "right" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            <div className="text-center">
              <div className="text-6xl animate-bounce">
                {npcAnimation.phase === "action" ? "🙇‍♂️" : "🧙‍♂️"}
              </div>
              {npcAnimation.phase === "action" && (
                <div className="bg-purple-600 text-white p-2 rounded-lg mt-2 text-xs pixelated">
                  "The great cactus brings wisdom!" 🌵
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minigame Modal */}
      {activeMinigame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {activeMinigame.type === "mod_approval" && (
            <ModApprovalMinigame onComplete={handleMinigameComplete} />
          )}
          {activeMinigame.type === "cactus_lottery" && (
            <CactusLotteryMinigame onComplete={handleMinigameComplete} />
          )}
          {activeMinigame.type === "count_cactus" && (
            <CountCactusMinigame onComplete={handleMinigameComplete} />
          )}
          {activeMinigame.type === "tech_calibration" && (
            <TechCalibrationMinigame onComplete={handleMinigameComplete} />
          )}
          {activeMinigame.type === "sprinkler_puzzle" && (
            <SprinklerPuzzleMinigame
              onComplete={handleMinigameComplete}
              onFailure={handleSprinklerFailure}
            />
          )}
        </div>
      )}

      {/* Header UI */}
      <Header
        source={source}
        tps={tps}
        totalCactiHarvested={totalCactiHarvested}
        autoFarms={autoFarms}
        showInventory={showInventory}
        setShowInventory={setShowInventory}
        showShop={showShop}
        setShowShop={setShowShop}
      />

      {/* Shop Modal */}
      <Shop
        showShop={showShop}
        setShowShop={setShowShop}
        source={source}
        purchaseItem={purchaseItem}
        shopRef={shopRef}
      />

      {/* Inventory Modal */}
      <Inventory
        showInventory={showInventory}
        setShowInventory={setShowInventory}
        inventory={inventory}
        inventoryRef={inventoryRef}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />

      {/* Hotbar */}
      <Hotbar
        hotbar={hotbar}
        selectedHotbarSlot={selectedHotbarSlot}
        setSelectedHotbarSlot={setSelectedHotbarSlot}
        hotbarRef={hotbarRef}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />

      {/* Game World - Original from old App.js */}
      <div className="fixed top-16 left-0 right-0 bottom-20">
        {/* Sky Layer */}
        <div
          className="absolute w-full"
          style={{
            top: 0,
            height: `${layout.skyHeight}px`,
            backgroundImage: `url('https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=1200&h=400&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: `${-scrollPosition * 0.2}px center`,
          }}
        />

        {/* Farming Layer */}
        <div
          ref={gameWorldRef}
          className="absolute w-full cursor-crosshair"
          style={{
            top: `${layout.farmingTop - 64}px`,
            height: `${layout.farmingHeight}px`,
            backgroundColor: "rgba(101, 67, 33, 0.3)",
            pointerEvents: "auto",
          }}
          onClick={handleWorldClick}
        >
          <div
            className="absolute inset-0"
            style={{
              width: CONFIG.world.width,
              transform: `translateX(-${scrollPosition}px)`,
            }}
          >
            {/* Farming Blocks */}
            {Object.entries(farmingBlocks).map(([blockX, block]) => {
              const worldX = getWorldX(parseInt(blockX));
              return (
                <div
                  key={blockX}
                  className={`absolute border-2 border-brown-400 border-opacity-50 farming-block cursor-pointer transition-all duration-200 ${
                    draggedItem ? "drop-zone" : ""
                  }`}
                  style={{
                    left: worldX,
                    top: 0,
                    width: CONFIG.world.blockSize,
                    height: layout.farmingHeight,
                    backgroundColor: block.occupied
                      ? "rgba(101, 67, 33, 0.4)"
                      : "rgba(101, 67, 33, 0.2)",
                    pointerEvents: "auto",
                  }}
                  onClick={(event) =>
                    handleFarmingBlockClick(parseInt(blockX), event)
                  }
                  onDragOver={handleFarmingBlockDragOver}
                  onDrop={(event) =>
                    handleFarmingBlockDrop(event, parseInt(blockX))
                  }
                />
              );
            })}

            {/* Manual Crops */}
            {manualCrops.map((crop) => {
              const worldX = getWorldX(crop.blockX);
              const growthHeight = 30 + (crop.growth / 100) * 80;

              return (
                <div
                  key={crop.id}
                  className="absolute flex items-end justify-center"
                  style={{
                    left: worldX,
                    top: 0,
                    width: CONFIG.world.blockSize,
                    height: layout.farmingHeight,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className={`bg-green-500 border-2 border-green-700 rounded-t-lg transition-all duration-300 flex items-center justify-center ${
                      crop.growth >= 100
                        ? "animate-pulse shadow-lg shadow-green-400"
                        : ""
                    }`}
                    style={{
                      width: "80px",
                      height: `${growthHeight}px`,
                    }}
                  >
                    <span className="text-3xl">
                      {crop.growth >= 100
                        ? "🌵"
                        : crop.growth >= 50
                        ? "🌱"
                        : "🟫"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Auto Farms */}
            {autoFarms.map((farm) => {
              const farmType = CONFIG.farmTypes.find(
                (ft) => ft.id === farm.type
              );
              return (
                <div
                  key={farm.id}
                  className="absolute"
                  style={{
                    left: farm.position.x,
                    top: farm.position.y,
                  }}
                >
                  <div className="text-6xl animate-pulse">
                    {farmType?.icon || "🏭"}
                  </div>
                  <div className="text-xs bg-black text-white p-1 rounded mt-1">
                    +{farmType?.production || 0}/tick
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ground Layer */}
        <div
          className="absolute w-full"
          style={{
            top: `${layout.groundTop - 64}px`,
            height: `${layout.groundHeight}px`,
            backgroundImage: `url('https://images.unsplash.com/photo-1542639492-23184001faed?w=1200&h=300&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: `${-scrollPosition * 0.5}px center`,
          }}
        />
      </div>
    </div>
  );
}

export default App;
