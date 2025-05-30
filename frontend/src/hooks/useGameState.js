import { useState, useEffect, useCallback } from "react";
import { CONFIG } from "../config/gameConfig";

export const useGameState = () => {
  // Core game state
  const [source, setSource] = useState(10000);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tps, setTPS] = useState(20);
  const [totalCactiHarvested, setTotalCactiHarvested] = useState(0);
  const [blameCount, setBlameCount] = useState(0);

  // World state - Extended farming area to cover entire canvas plus extra
  const [farmingBlocks, setFarmingBlocks] = useState(() => {
    const blocks = {};
    const startBlock = 0;
    // Extend beyond canvas width to match the extended farmland tiles
    const endBlock = Math.floor(
      (CONFIG.world.width + 500) / CONFIG.world.blockSize
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

  // UI state
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [npcAnimation, setNpcAnimation] = useState(null);
  const [farmPlacement, setFarmPlacement] = useState(null);
  const [failurePopup, setFailurePopup] = useState(null);

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

  // Keyboard controls for scrolling
  useEffect(() => {
    const keysRef = { current: {} };

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;

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

  return {
    // Core state
    source,
    setSource,
    scrollPosition,
    setScrollPosition,
    tps,
    setTPS,
    totalCactiHarvested,
    setTotalCactiHarvested,
    blameCount,
    setBlameCount,

    // World state
    farmingBlocks,
    setFarmingBlocks,
    autoFarms,
    setAutoFarms,
    manualCrops,
    setManualCrops,

    // UI state
    showInventory,
    setShowInventory,
    showShop,
    setShowShop,
    notifications,
    setNotifications,
    activeMinigame,
    setActiveMinigame,
    npcAnimation,
    setNpcAnimation,
    farmPlacement,
    setFarmPlacement,
    failurePopup,
    setFailurePopup,

    // Functions
    addNotification,
  };
};
