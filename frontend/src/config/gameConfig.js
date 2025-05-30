export const CONFIG = {
  world: {
    width: 3000,
    height: 600,
    blockSize: 100,
    viewportWidth: 1200,
  },

  inventory: {
    hotbarSize: 7,
    maxSlots: 48, // Extended from 24 to 48 (8x6 grid)
    inventoryRows: 6,
    inventoryColumns: 8,
  },

  source: {
    basePerCactus: 10,
  },

  assets: {
    backgrounds: {
      desert: "/assets/desert-background-2.png",
      desertWithSky: "/assets/desert-background-with-sky.png",
      sky: "/assets/sky-1.png",
    },
    farmland: {
      left: "/assets/farmland-1.png",
      middle: "/assets/farmland-2.png",
      right: "/assets/farmland-3.png",
    },
    cactus: {
      stage1: "/assets/cactus-1.png",
      stage2: "/assets/cactus-2.png",
      stage3: "/assets/cactus-3.png",
    },
  },

  items: {
    seeds: [
      {
        id: "cactus_seed",
        name: "Cactus Seed",
        description: "Plant to grow cacti",
        icon: "/assets/cactus-seed.png",
        cost: 5,
        type: "seed",
      },
    ],
    wands: [
      {
        id: "growth_wand_basic",
        name: "Basic Growth Wand",
        description: "Accelerates plant growth",
        icon: "🪄",
        cost: 50,
        type: "tool",
        growthPower: 1,
      },
      {
        id: "growth_wand_advanced",
        name: "Advanced Growth Wand",
        description: "Rapidly accelerates plant growth",
        icon: "✨",
        cost: 200,
        type: "tool",
        growthPower: 3,
      },
    ],
    hoes: [
      {
        id: "hoe_bronze",
        name: "Bronze Hoe",
        description: "Harvest mature cacti",
        icon: "/assets/hoe_bronze.png",
        cost: 25,
        type: "tool",
        harvestPower: 1,
      },
      {
        id: "hoe_silver",
        name: "Silver Hoe",
        description: "Harvest cacti efficiently",
        icon: "/assets/hoe_silver.png",
        cost: 75,
        type: "tool",
        harvestPower: 2,
      },
      {
        id: "hoe_gold",
        name: "Gold Hoe",
        description: "Harvest cacti very efficiently",
        icon: "/assets/hoe_gold.png",
        cost: 150,
        type: "tool",
        harvestPower: 3,
      },
      {
        id: "hoe_diamond",
        name: "Diamond Hoe",
        description: "Maximum harvest efficiency",
        icon: "/assets/hoe_diamond.png",
        cost: 300,
        type: "tool",
        harvestPower: 5,
      },
    ],
    farms: [
      {
        id: "auto_farm_basic",
        name: "Basic Auto Farm",
        description: "Automatically produces cacti",
        icon: "🏭",
        cost: 1000,
        type: "farm",
        minigame: "mod_approval",
      },
      {
        id: "sprinkler_farm",
        name: "Sprinkler Farm",
        description: "Advanced irrigation system",
        icon: "💧",
        cost: 2500,
        type: "farm",
        minigame: "sprinkler_puzzle",
      },
      {
        id: "tech_farm",
        name: "Tech Farm",
        description: "High-tech automated farming",
        icon: "🤖",
        cost: 5000,
        type: "farm",
        minigame: "tech_calibration",
      },
      {
        id: "lottery_farm",
        name: "Lottery Farm",
        description: "Luck-based cactus production",
        icon: "🎰",
        cost: 3500,
        type: "farm",
        minigame: "cactus_lottery",
      },
    ],
  },

  farmTypes: [
    {
      id: "auto_farm_basic",
      name: "Basic Auto Farm",
      icon: "🏭",
      production: 5,
      minigame: "mod_approval",
    },
    {
      id: "sprinkler_farm",
      name: "Sprinkler Farm",
      icon: "💧",
      production: 15,
      minigame: "sprinkler_puzzle",
    },
    {
      id: "tech_farm",
      name: "Tech Farm",
      icon: "🤖",
      production: 25,
      minigame: "tech_calibration",
    },
    {
      id: "lottery_farm",
      name: "Lottery Farm",
      icon: "🎰",
      production: 20,
      minigame: "cactus_lottery",
    },
  ],
};
