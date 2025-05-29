import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// Game Configuration
const CONFIG = {
  source: {
    basePerCactus: 5,
    multiplier: 1,
  },
  tps: {
    maxTPS: 20,
    tpsDecayRate: 0.05,
  },
  world: {
    width: 4000,
    viewportWidth: 1200,
    farmingAreaStart: 200,
    farmingAreaEnd: 3800,
    blockSize: 120,
    layout: {
      groundHeight: 30,
      farmingHeight: 30,
      skyHeight: 40,
    },
  },
  inventory: {
    hotbarSize: 5,
    maxItems: 20,
  },
  items: {
    seeds: [{ id: "cactus_seed", name: "Cactus Seed", cost: 5, icon: "🌰" }],
    wands: [
      {
        id: "wooden_wand",
        name: "Wooden Wand",
        cost: 0,
        growthPower: 1,
        aoe: 0,
        icon: "🪄",
      },
      {
        id: "oak_wand",
        name: "Oak Wand",
        cost: 50,
        growthPower: 2,
        aoe: 1,
        icon: "✨",
      },
      {
        id: "silverwood_wand",
        name: "Silverwood Wand",
        cost: 200,
        growthPower: 4,
        aoe: 2,
        icon: "🔮",
      },
      {
        id: "thaumcraft_focus",
        name: "Thaumcraft Focus",
        cost: 500,
        growthPower: 6,
        aoe: 3,
        icon: "⚡",
      },
    ],
    hoes: [
      {
        id: "wooden_hoe",
        name: "Wooden Hoe",
        cost: 0,
        harvestPower: 1,
        aoe: 0,
        icon: "🔧",
      },
      {
        id: "iron_hoe",
        name: "Iron Hoe",
        cost: 75,
        harvestPower: 2,
        aoe: 1,
        icon: "⚒️",
      },
      {
        id: "mattock",
        name: "Mattock",
        cost: 300,
        harvestPower: 4,
        aoe: 2,
        icon: "🛠️",
      },
      {
        id: "kama",
        name: "Kama",
        cost: 800,
        harvestPower: 6,
        aoe: 3,
        icon: "⚔️",
      },
    ],
  },
  farmTypes: [
    {
      id: "vanilla_basic",
      name: "Basic Cactus Farm",
      cost: 100,
      description: "Simple vanilla Minecraft cactus farm",
      production: 1,
      minigame: "mod_approval",
      size: { width: 2, height: 1 },
      icon: "🏠",
    },
    {
      id: "vanilla_advanced",
      name: "Piston Cactus Farm",
      cost: 500,
      description: "Automated piston-based harvester",
      production: 5,
      minigame: "cactus_lottery",
      size: { width: 3, height: 1 },
      icon: "🏭",
    },
    {
      id: "mystical_agriculture",
      name: "Mystical Agriculture Plot",
      cost: 1000,
      description: "Magical essence-infused growing",
      production: 10,
      minigame: "count_cactus",
      size: { width: 3, height: 1 },
      icon: "🔯",
    },
    {
      id: "industrial_foregoing",
      name: "Plant Gatherer",
      cost: 2000,
      description: "High-tech automated harvesting",
      production: 20,
      minigame: "tech_calibration",
      size: { width: 4, height: 1 },
      icon: "⚙️",
    },
    {
      id: "stardew_greenhouse",
      name: "Stardew Greenhouse",
      cost: 3000,
      description: "Year-round magical growing",
      production: 30,
      minigame: "sprinkler_puzzle",
      size: { width: 5, height: 1 },
      icon: "🏛️",
    },
  ],
  players: [
    { name: "BlockMaster2024", avatar: "🧱" },
    { name: "RedstoneWizard", avatar: "⚡" },
    { name: "CactusSkeptic", avatar: "🤨" },
    { name: "BuildCrafter", avatar: "🔨" },
  ],
  mods: [
    { name: "Admin_Sarah", avatar: "👮‍♀️", personality: "strict" },
    { name: "Mod_Jackson", avatar: "🛡️", personality: "suspicious" },
  ],
};

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

  // Get block coordinate from world X position
  const getBlockX = (worldX) => {
    return Math.floor(worldX / CONFIG.world.blockSize);
  };

  // Get world X position from block coordinate
  const getWorldX = (blockX) => {
    return blockX * CONFIG.world.blockSize;
  };

  // Handle farming block click
  const handleFarmingBlockClick = (blockX, event) => {
    event.stopPropagation();
    console.log("Farming block clicked!", blockX);

    if (showInventory || showShop) return;

    const block = farmingBlocks[blockX];
    if (!block) return;

    const selectedItem = hotbar[selectedHotbarSlot];
    if (!selectedItem) {
      addNotification("⚠️ Select a tool or seed first!", "warning", 1500);
      return;
    }

    // Handle planting seeds
    if (selectedItem.id === "cactus_seed" && !block.occupied) {
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

      // Consume seed
      setHotbar((prev) => {
        const newHotbar = [...prev];
        if (newHotbar[selectedHotbarSlot].quantity > 1) {
          newHotbar[selectedHotbarSlot] = {
            ...newHotbar[selectedHotbarSlot],
            quantity: newHotbar[selectedHotbarSlot].quantity - 1,
          };
        } else {
          newHotbar[selectedHotbarSlot] = null;
        }
        return newHotbar;
      });

      addNotification("🌱 Cactus planted!", "plant", 1500);
    } else if (selectedItem.growthPower && block.crop) {
      const crop = manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth < 100) {
        const growthIncrease = selectedItem.growthPower * 15;
        setManualCrops((prev) =>
          prev.map((c) =>
            c.id === crop.id
              ? { ...c, growth: Math.min(100, c.growth + growthIncrease) }
              : c
          )
        );
        addNotification(`+${growthIncrease}% growth`, "growth", 1000);
      } else if (crop && crop.growth >= 100) {
        addNotification(
          "🌵 Use a hoe to harvest this cactus!",
          "warning",
          1500
        );
      }
    } else if (selectedItem.harvestPower && block.crop) {
      const crop = manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth >= 100) {
        const sourceGained =
          CONFIG.source.basePerCactus * selectedItem.harvestPower;
        setSource((prev) => prev + sourceGained);
        setTotalCactiHarvested((prev) => prev + 1);

        setManualCrops((prev) => prev.filter((c) => c.id !== crop.id));
        setFarmingBlocks((prev) => ({
          ...prev,
          [blockX]: { ...block, occupied: false, crop: null },
        }));

        addNotification(`+${sourceGained} Source`, "source", 1500);
      } else if (crop && crop.growth < 100) {
        addNotification(
          "🌱 This cactus isn't ready to harvest yet!",
          "warning",
          1500
        );
      }
    } else if (selectedItem.id === "cactus_seed" && block.occupied) {
      addNotification("⚠️ This block is already occupied!", "warning", 1500);
    }
  };

  // Handle world click for farming
  const handleWorldClick = (event) => {
    console.log("World clicked!"); // Debug log

    // Prevent interaction if any modals are open
    if (showInventory || showShop) {
      console.log("Modal open, blocking interaction");
      return;
    }

    const rect = gameWorldRef.current.getBoundingClientRect();
    const worldX = event.clientX - rect.left + scrollPosition;
    const worldY = event.clientY - rect.top;

    console.log("Click position:", { worldX, worldY }); // Debug log

    const layout = getLayoutPositions();

    // Adjust for the offset since farming layer is offset by -64px
    const adjustedFarmingTop = layout.farmingTop - 64;
    const adjustedFarmingBottom = adjustedFarmingTop + layout.farmingHeight;

    console.log("Farming bounds:", {
      adjustedFarmingTop,
      adjustedFarmingBottom,
    }); // Debug log

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
    const block = farmingBlocks[blockX];

    console.log("Block info:", { blockX, block }); // Debug log

    if (!block) return;

    const selectedItem = hotbar[selectedHotbarSlot];
    console.log("Selected item:", selectedItem); // Debug log

    if (!selectedItem) {
      addNotification("⚠️ Select a tool or seed first!", "warning", 1500);
      return;
    }

    // Handle planting seeds
    if (selectedItem.id === "cactus_seed" && !block.occupied) {
      console.log("Planting seed!"); // Debug log

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

      // Consume seed
      setHotbar((prev) => {
        const newHotbar = [...prev];
        if (newHotbar[selectedHotbarSlot].quantity > 1) {
          newHotbar[selectedHotbarSlot] = {
            ...newHotbar[selectedHotbarSlot],
            quantity: newHotbar[selectedHotbarSlot].quantity - 1,
          };
        } else {
          newHotbar[selectedHotbarSlot] = null;
        }
        return newHotbar;
      });

      addNotification("🌱 Cactus planted!", "plant", 1500);

      // Handle growing crops with wand
    } else if (selectedItem.growthPower && block.crop) {
      const crop = manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth < 100) {
        const growthIncrease = selectedItem.growthPower * 15;
        setManualCrops((prev) =>
          prev.map((c) =>
            c.id === crop.id
              ? { ...c, growth: Math.min(100, c.growth + growthIncrease) }
              : c
          )
        );
        addNotification(`+${growthIncrease}% growth`, "growth", 1000);
      } else if (crop && crop.growth >= 100) {
        addNotification(
          "🌵 Use a hoe to harvest this cactus!",
          "warning",
          1500
        );
      }

      // Handle harvesting with hoe
    } else if (selectedItem.harvestPower && block.crop) {
      const crop = manualCrops.find((c) => c.id === block.crop);
      if (crop && crop.growth >= 100) {
        const sourceGained =
          CONFIG.source.basePerCactus * selectedItem.harvestPower;
        setSource((prev) => prev + sourceGained);
        setTotalCactiHarvested((prev) => prev + 1);

        setManualCrops((prev) => prev.filter((c) => c.id !== crop.id));
        setFarmingBlocks((prev) => ({
          ...prev,
          [blockX]: { ...block, occupied: false, crop: null },
        }));

        addNotification(`+${sourceGained} Source`, "source", 1500);
      } else if (crop && crop.growth < 100) {
        addNotification(
          "🌱 This cactus isn't ready to harvest yet!",
          "warning",
          1500
        );
      }
    } else if (selectedItem.id === "cactus_seed" && block.occupied) {
      addNotification("⚠️ This block is already occupied!", "warning", 1500);
    }
  };

  // Auto farm production
  useEffect(() => {
    const interval = setInterval(() => {
      autoFarms.forEach((farm) => {
        const farmType = CONFIG.farmTypes.find((ft) => ft.id === farm.type);
        const production =
          farmType.production * (farm.upgrades?.multiplier || 1);
        setSource((prev) => prev + production);
        setTotalCactiHarvested((prev) => prev + production);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoFarms]);

  // Purchase item
  const purchaseItem = (item) => {
    if (source >= item.cost) {
      setSource((prev) => prev - item.cost);
      setInventory((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        // Special case for seeds - give 5 instead of 1
        const quantityToAdd = item.id === "cactus_seed" ? 5 : 1;

        if (existing) {
          return prev.map((i) =>
            i.id === item.id
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
    }
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
  }, [totalCactiHarvested]);

  const layout = getLayoutPositions();

  return (
    <div className="min-h-screen overflow-hidden no-select">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-3 rounded-lg pixelated text-sm max-w-sm animate-fade-in ${
              notif.type === "blame"
                ? "bg-red-500 text-white"
                : notif.type === "cultist"
                ? "bg-purple-500 text-white"
                : notif.type === "source"
                ? "bg-green-500 text-white"
                : notif.type === "growth"
                ? "bg-blue-500 text-white"
                : notif.type === "warning"
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-white"
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>

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

      {/* Header UI */}
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

      {/* Game World */}
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
                  className="absolute border-2 border-brown-400 border-opacity-50 farming-block cursor-pointer"
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

      {/* Hotbar - always fully interactive */}
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
          Use arrow keys to scroll • 1-5 keys for hotbar • Drag items to
          organize
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventory && (
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
      )}

      {/* Shop Modal */}
      {showShop && (
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          <div className="text-xs">
                            Growth: {item.growthPower}x
                          </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
