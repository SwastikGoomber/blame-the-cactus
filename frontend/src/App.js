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
import { useGameState } from "./hooks/useGameState";
import { useFarmingLogic } from "./hooks/useFarmingLogic";
import { useInventorySystem } from "./hooks/useInventorySystem";

function App() {
  // Custom hooks for better organization
  const gameState = useGameState();
  const inventorySystem = useInventorySystem();
  const farmingLogic = useFarmingLogic(gameState, inventorySystem);

  // Layout calculations - Fixed to align bottom of chunks with top of farmland
  const getLayoutPositions = () => {
    const viewportHeight = window.innerHeight;
    const headerHeight = 64;
    const farmlandHeight = 100;
    const farmingHeight = 120;

    return {
      headerHeight,
      farmlandHeight,
      farmingHeight,
      // Align bottom of farming chunks with top of farmland
      farmingTop: viewportHeight - farmlandHeight - farmingHeight,
      farmlandTop: viewportHeight - farmlandHeight, // Absolute bottom
    };
  };

  const layout = getLayoutPositions();

  // Calculate farmland tiles - Increased to ensure complete coverage
  const farmlandTileWidth = 100;
  const totalCanvasWidth = CONFIG.world.width;
  // Add even more tiles to ensure complete coverage beyond the right edge
  const totalFarmlandTiles =
    Math.ceil(totalCanvasWidth / farmlandTileWidth) + 5;

  // Get farmland tile asset based on position
  const getFarmlandAsset = (blockIndex, totalBlocks) => {
    if (blockIndex === 0) return CONFIG.assets.farmland.left;
    if (blockIndex === totalBlocks - 1) return CONFIG.assets.farmland.right;
    return CONFIG.assets.farmland.middle;
  };

  return (
    <div className="min-h-screen overflow-hidden no-select">
      {/* Notifications */}
      <Notifications notifications={gameState.notifications} />

      {/* External Failure Popup for Sprinkler Minigame */}
      {gameState.failurePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-red-500 text-white p-8 rounded-lg max-w-md mx-4 text-center animate-pulse border-4 border-red-300">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-bold mb-4 pixelated">
              MINIGAME FAILED!
            </h2>
            <p className="text-lg mb-4 pixelated">{gameState.failurePopup}</p>
            <p className="text-sm opacity-75">
              Press ESC or wait to continue...
            </p>
          </div>
        </div>
      )}

      {/* NPC Animation Overlay */}
      {gameState.npcAnimation && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div
            className="absolute transition-all duration-100"
            style={{
              left: `${gameState.npcAnimation.position}%`,
              bottom: "120px",
              transform:
                gameState.npcAnimation.direction === "right"
                  ? "scaleX(-1)"
                  : "scaleX(1)",
            }}
          >
            <div className="text-center">
              <div className="text-6xl animate-bounce">
                {gameState.npcAnimation.phase === "action" ? "🙇‍♂️" : "🧙‍♂️"}
              </div>
              {gameState.npcAnimation.phase === "action" && (
                <div className="bg-purple-600 text-white p-2 rounded-lg mt-2 text-xs pixelated">
                  "The great cactus brings wisdom!" 🌵
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minigame Modal */}
      {gameState.activeMinigame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {gameState.activeMinigame.type === "mod_approval" && (
            <ModApprovalMinigame
              onComplete={farmingLogic.handleMinigameComplete}
            />
          )}
          {gameState.activeMinigame.type === "cactus_lottery" && (
            <CactusLotteryMinigame
              onComplete={farmingLogic.handleMinigameComplete}
            />
          )}
          {gameState.activeMinigame.type === "count_cactus" && (
            <CountCactusMinigame
              onComplete={farmingLogic.handleMinigameComplete}
            />
          )}
          {gameState.activeMinigame.type === "tech_calibration" && (
            <TechCalibrationMinigame
              onComplete={farmingLogic.handleMinigameComplete}
            />
          )}
          {gameState.activeMinigame.type === "sprinkler_puzzle" && (
            <SprinklerPuzzleMinigame
              onComplete={farmingLogic.handleMinigameComplete}
              onFailure={farmingLogic.handleSprinklerFailure}
            />
          )}
        </div>
      )}

      {/* Header UI */}
      <Header
        source={gameState.source}
        tps={gameState.tps}
        totalCactiHarvested={gameState.totalCactiHarvested}
        autoFarms={gameState.autoFarms}
        showInventory={gameState.showInventory}
        setShowInventory={gameState.setShowInventory}
        showShop={gameState.showShop}
        setShowShop={gameState.setShowShop}
      />

      {/* Shop Modal */}
      <Shop
        showShop={gameState.showShop}
        setShowShop={gameState.setShowShop}
        source={gameState.source}
        purchaseItem={farmingLogic.purchaseItem}
        shopRef={inventorySystem.shopRef}
      />

      {/* Inventory Modal */}
      <Inventory
        showInventory={gameState.showInventory}
        setShowInventory={gameState.setShowInventory}
        inventory={inventorySystem.inventory}
        inventoryRef={inventorySystem.inventoryRef}
        handleDragStart={inventorySystem.handleDragStart}
        handleDragEnd={inventorySystem.handleDragEnd}
        handleDragOver={inventorySystem.handleDragOver}
        handleDrop={inventorySystem.handleDrop}
      />

      {/* Hotbar - At absolute bottom of screen */}
      <div
        style={{
          position: "fixed",
          bottom: "0px", // Absolute bottom of screen
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
        }}
      >
        <Hotbar
          hotbar={inventorySystem.hotbar}
          selectedHotbarSlot={inventorySystem.selectedHotbarSlot}
          setSelectedHotbarSlot={inventorySystem.setSelectedHotbarSlot}
          hotbarRef={inventorySystem.hotbarRef}
          handleDragStart={inventorySystem.handleDragStart}
          handleDragEnd={inventorySystem.handleDragEnd}
          handleDragOver={inventorySystem.handleDragOver}
          handleDrop={inventorySystem.handleDrop}
        />
      </div>

      {/* Game World - Fixed Layout */}
      <div className="fixed top-16 left-0 right-0 bottom-0">
        {/* Desert Background - Seamlessly connects to farmland */}
        <div
          className="absolute w-full"
          style={{
            top: 0,
            bottom: `${layout.farmlandHeight}px`, // No gap - connects directly
            backgroundImage: `url('${CONFIG.assets.backgrounds.desertWithSky}')`,
            backgroundSize: "cover",
            backgroundPosition: `${-gameState.scrollPosition * 0.2}px center`,
            backgroundRepeat: "repeat-x",
            zIndex: 1,
          }}
        />

        {/* Farmland Layer - Complete coverage with extra tiles */}
        <div
          className="absolute w-full"
          style={{
            bottom: 0,
            height: `${layout.farmlandHeight}px`,
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              width: CONFIG.world.width + 500, // Extra width to ensure complete coverage
              transform: `translateX(-${gameState.scrollPosition}px)`,
            }}
          >
            {/* Extended Farmland Tiles - Complete coverage with more tiles */}
            {Array.from({ length: totalFarmlandTiles }, (_, index) => {
              const tileX = index * farmlandTileWidth;
              const farmlandAsset = getFarmlandAsset(index, totalFarmlandTiles);

              return (
                <div
                  key={`farmland-tile-${index}`}
                  className="absolute"
                  style={{
                    left: tileX,
                    top: 0,
                    width: farmlandTileWidth,
                    height: layout.farmlandHeight,
                    backgroundImage: `url('${farmlandAsset}')`,
                    backgroundSize: `${farmlandTileWidth}px ${layout.farmlandHeight}px`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    imageRendering: "pixelated",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Farming Layer - Bottom aligned with top of farmland */}
        <div
          ref={farmingLogic.gameWorldRef}
          className="absolute w-full cursor-crosshair"
          style={{
            bottom: `${layout.farmlandHeight}px`, // Bottom of chunks aligns with top of farmland
            height: `${layout.farmingHeight}px`,
            backgroundColor: "transparent",
            pointerEvents: "auto",
            zIndex: 10,
          }}
          onClick={farmingLogic.handleWorldClick}
        >
          <div
            className="absolute inset-0"
            style={{
              width: CONFIG.world.width,
              transform: `translateX(-${gameState.scrollPosition}px)`,
            }}
          >
            {/* Interactive Farming Blocks - Bottom aligned with farmland top */}
            {Object.entries(gameState.farmingBlocks).map(([blockX, block]) => {
              const worldX = farmingLogic.getWorldX(parseInt(blockX));
              return (
                <div
                  key={blockX}
                  className={`absolute border cursor-pointer transition-all duration-200 ${
                    inventorySystem.draggedItem
                      ? "drop-zone hover:border-white hover:border-opacity-60"
                      : ""
                  } ${
                    block.occupied
                      ? "hover:border-yellow-400"
                      : "hover:border-green-400"
                  }`}
                  style={{
                    left: worldX,
                    top: 0,
                    width: CONFIG.world.blockSize,
                    height: layout.farmingHeight,
                    backgroundColor: "transparent",
                    borderColor: block.occupied
                      ? "rgba(251, 191, 36, 0.3)"
                      : "rgba(34, 197, 94, 0.3)",
                    borderWidth: "1px",
                    borderStyle: inventorySystem.draggedItem
                      ? "dashed"
                      : "solid",
                    pointerEvents: "auto",
                  }}
                  onClick={(event) =>
                    farmingLogic.handleFarmingBlockClick(
                      parseInt(blockX),
                      event
                    )
                  }
                  onDragOver={farmingLogic.handleFarmingBlockDragOver}
                  onDrop={(event) =>
                    farmingLogic.handleFarmingBlockDrop(event, parseInt(blockX))
                  }
                />
              );
            })}

            {/* Manual Crops - Bottom aligned with farmland top */}
            {gameState.manualCrops.map((crop) => {
              const worldX = farmingLogic.getWorldX(crop.blockX);
              const cactusAsset = farmingLogic.getCactusAsset(crop.growth);

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
                    zIndex: 15,
                  }}
                >
                  <img
                    src={cactusAsset}
                    alt={`Cactus ${crop.growth}%`}
                    className={`transition-all duration-300 ${
                      crop.growth >= 100
                        ? "animate-pulse filter drop-shadow-lg"
                        : ""
                    }`}
                    style={farmingLogic.getCactusStyle(crop.growth)}
                  />
                </div>
              );
            })}

            {/* Auto Farms - Bottom aligned with farmland top */}
            {gameState.autoFarms.map((farm) => {
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
                    zIndex: 15,
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
      </div>
    </div>
  );
}

export default App;
