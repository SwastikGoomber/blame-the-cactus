import React, { useState, useEffect } from "react";

export const ModApprovalMinigame = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    checkbox1: false,
    checkbox2: false,
    checkbox3: false,
  });
  const [movingCheckbox, setMovingCheckbox] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setMovingCheckbox(Math.floor(Math.random() * 3) + 1);
        setTimeout(() => setMovingCheckbox(null), 1000);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (
      formData.name &&
      formData.reason &&
      formData.checkbox1 &&
      formData.checkbox2 &&
      formData.checkbox3
    ) {
      onComplete(true);
    } else {
      onComplete(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-md mx-4">
      <h3 className="text-xl font-bold mb-4 pixelated">📋 Mod Approval Form</h3>
      <p className="text-sm mb-4 italic">
        "Submit your cactus farm application."
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Your Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded text-sm"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">
            Reason for farm:
          </label>
          <select
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">Select reason...</option>
            <option value="science">For science</option>
            <option value="annoy">To annoy mods</option>
            <option value="dunno">I dunno</option>
            <option value="profit">Profit!</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold">
            Required Checkboxes:
          </label>

          <div
            className={`flex items-center transition-all duration-300 ${
              movingCheckbox === 1 ? "transform translate-x-4" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={formData.checkbox1}
              onChange={(e) =>
                setFormData({ ...formData, checkbox1: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">I agree to farm responsibly</span>
          </div>

          <div
            className={`flex items-center transition-all duration-300 ${
              movingCheckbox === 2 ? "transform translate-x-4" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={formData.checkbox2}
              onChange={(e) =>
                setFormData({ ...formData, checkbox2: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">I will not spam cacti</span>
          </div>

          <div
            className={`flex items-center transition-all duration-300 ${
              movingCheckbox === 3 ? "transform translate-x-4" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={formData.checkbox3}
              onChange={(e) =>
                setFormData({ ...formData, checkbox3: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">I understand mod supremacy</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded pixelated flex-1"
          >
            📋 Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};

export const CactusLotteryMinigame = ({ onComplete }) => {
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Rigged to succeed after 3-6 attempts
      const willWin = newAttempts >= 3 + Math.floor(Math.random() * 4);

      if (willWin) {
        setResult("🌵");
        setTimeout(() => onComplete(true), 1500);
      } else {
        const losing = ["🍎", "🍌", "🍇", "🥝", "🍒"];
        setResult(losing[Math.floor(Math.random() * losing.length)]);
      }
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-md mx-4 text-center">
      <h3 className="text-xl font-bold mb-4 pixelated">🎰 Cactus Lottery</h3>
      <p className="text-sm mb-4 italic">"Spin for a cactus to proceed!"</p>

      <div className="mb-6">
        <div className="text-6xl mb-4 h-20 flex items-center justify-center">
          {spinning ? (
            <div className="animate-spin">🎲</div>
          ) : result ? (
            result
          ) : (
            "❓"
          )}
        </div>

        <p className="text-sm text-gray-600">
          Attempts: {attempts} / {attempts >= 3 ? "???" : "???"}
        </p>
      </div>

      <button
        onClick={spin}
        disabled={spinning || result === "🌵"}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded pixelated disabled:opacity-50"
      >
        {spinning ? "🎰 Spinning..." : "🎰 Spin!"}
      </button>

      {result && result !== "🌵" && (
        <p className="text-sm text-red-600 mt-2">Try again!</p>
      )}
    </div>
  );
};

export const CountCactusMinigame = ({ onComplete }) => {
  const [gamePhase, setGamePhase] = useState("showing"); // showing, hidden, answer
  const [grid, setGrid] = useState([]);
  const [cactusCount, setCactusCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    // Generate random grid
    const newGrid = [];
    let actualCactusCount = 0;
    const items = ["🌵", "🌳", "🪨", "🌸", "🍄", "🌿", "🌺", "🪴"];

    for (let i = 0; i < 81; i++) {
      // 9x9 = 81
      if (Math.random() < 0.15) {
        // 15% chance for cactus
        newGrid.push("🌵");
        actualCactusCount++;
      } else {
        newGrid.push(items[Math.floor(Math.random() * items.length)]);
      }
    }

    setGrid(newGrid);
    setCactusCount(actualCactusCount);
  }, []);

  useEffect(() => {
    if (gamePhase === "showing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === "showing" && timeLeft === 0) {
      setGamePhase("hidden");
    }
  }, [gamePhase, timeLeft]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === cactusCount;
    setTimeout(() => onComplete(correct), 1000);
  };

  const generateAnswerOptions = () => {
    const options = [cactusCount];
    while (options.length < 4) {
      const option = cactusCount + Math.floor(Math.random() * 6) - 3;
      if (option >= 0 && !options.includes(option)) {
        options.push(option);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-2xl mx-4">
      <h3 className="text-xl font-bold mb-4 pixelated">👁️ Count the Cactus</h3>

      {gamePhase === "showing" && (
        <div className="text-center mb-4">
          <p className="text-lg font-bold text-red-600">
            Count the cacti! Time: {timeLeft}s
          </p>
        </div>
      )}

      {gamePhase === "hidden" && (
        <div className="text-center mb-4">
          <p className="text-lg font-bold">How many cacti did you see?</p>
        </div>
      )}

      <div className="grid grid-cols-9 gap-1 mb-4 mx-auto max-w-md">
        {grid.map((item, index) => (
          <div
            key={index}
            className="w-6 h-6 flex items-center justify-center text-xs border"
            style={{
              backgroundColor: gamePhase === "hidden" ? "#ccc" : "white",
            }}
          >
            {gamePhase === "showing" ? item : ""}
          </div>
        ))}
      </div>

      {gamePhase === "hidden" && (
        <div className="grid grid-cols-2 gap-3">
          {generateAnswerOptions().map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`p-3 rounded border-2 pixelated ${
                selectedAnswer === option
                  ? option === cactusCount
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {option} cacti
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TechCalibrationMinigame = ({ onComplete }) => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentShow, setCurrentShow] = useState(-1);
  const [gamePhase, setGamePhase] = useState("start");

  const colors = ["red", "blue", "green", "yellow"];
  const colorClasses = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
  };

  useEffect(() => {
    if (gamePhase === "start") {
      const newSequence = Array.from(
        { length: 4 },
        () => colors[Math.floor(Math.random() * colors.length)]
      );
      setSequence(newSequence);
      setTimeout(() => {
        setGamePhase("showing");
        showSequence(newSequence);
      }, 1000);
    }
  }, [gamePhase]);

  const showSequence = (seq) => {
    setShowingSequence(true);
    setCurrentShow(-1);

    seq.forEach((color, index) => {
      setTimeout(() => {
        setCurrentShow(index);
        setTimeout(() => setCurrentShow(-1), 500);
      }, index * 800);
    });

    setTimeout(() => {
      setShowingSequence(false);
      setGamePhase("input");
    }, seq.length * 800 + 500);
  };

  const handleColorClick = (color) => {
    if (showingSequence) return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    if (
      newUserSequence[newUserSequence.length - 1] !==
      sequence[newUserSequence.length - 1]
    ) {
      onComplete(false);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      onComplete(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-md mx-4 text-center">
      <h3 className="text-xl font-bold mb-4 pixelated">⚙️ Tech Calibration</h3>
      <p className="text-sm mb-4 italic">
        "Repeat the sequence to calibrate the machine!"
      </p>

      {gamePhase === "showing" && (
        <p className="mb-4 text-blue-600 font-bold">Watch the sequence...</p>
      )}

      {gamePhase === "input" && (
        <p className="mb-4 text-green-600 font-bold">
          Repeat the sequence! ({userSequence.length}/{sequence.length})
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {colors.map((color, index) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            disabled={showingSequence}
            className={`w-20 h-20 rounded-lg border-4 transition-all duration-200 ${
              colorClasses[color]
            } ${
              currentShow === sequence.indexOf(color) && showingSequence
                ? "scale-110 brightness-150"
                : "hover:scale-105"
            } ${
              showingSequence
                ? "cursor-not-allowed opacity-75"
                : "cursor-pointer"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const SprinklerPuzzleMinigame = ({ onComplete, onFailure }) => {
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [explosionEffect, setExplosionEffect] = useState(null);
  const [requiredCacti, setRequiredCacti] = useState(0);
  const [wateredCacti, setWateredCacti] = useState(0);

  // Initialize grid with cactus seedlings and TNT
  useEffect(() => {
    initializeGrid();
  }, []);

  // Shuffle grid every 1 second (faster chaos!)
  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      if (!gameOver) {
        shuffleGrid();
      }
    }, 1000); // Reduced from 2000ms to 1000ms

    return () => clearInterval(shuffleInterval);
  }, [gameOver, grid]);

  const initializeGrid = () => {
    const newGrid = Array(25)
      .fill(null)
      .map((_, index) => {
        const cellType = Math.random();
        return {
          id: index,
          type: cellType < 0.4 ? "cactus" : cellType < 0.7 ? "tnt" : "empty", // 40% cactus, 30% TNT, 30% empty
          watered: false,
          x: index % 5,
          y: Math.floor(index / 5),
          originalId: index,
        };
      });

    // Count initial required cacti
    const initialCactiCount = newGrid.filter(
      (cell) => cell.type === "cactus"
    ).length;
    setRequiredCacti(initialCactiCount);
    setWateredCacti(0);
    setGrid(newGrid);
  };

  const shuffleGrid = () => {
    setGrid((prevGrid) => {
      // Count current state
      const currentWatered = prevGrid.filter(
        (cell) => cell.type === "cactus" && cell.watered
      ).length;
      const currentUnwatered = prevGrid.filter(
        (cell) => cell.type === "cactus" && !cell.watered
      ).length;
      const totalRequired = currentWatered + currentUnwatered;

      // Create new grid ensuring we maintain the same number of cacti (watered + unwatered)
      const positions = Array.from({ length: 25 }, (_, i) => i);

      // First, place the required number of cacti
      const shuffledGrid = Array(25)
        .fill(null)
        .map((_, index) => ({
          id: index,
          type: "empty",
          watered: false,
          x: index % 5,
          y: Math.floor(index / 5),
          originalId: Math.floor(Math.random() * 1000000),
        }));

      // Randomly select positions for cacti
      const cactusPositions = [...positions]
        .sort(() => Math.random() - 0.5)
        .slice(0, totalRequired);

      // Place watered cacti
      for (let i = 0; i < currentWatered && i < cactusPositions.length; i++) {
        const pos = cactusPositions[i];
        shuffledGrid[pos] = {
          ...shuffledGrid[pos],
          type: "cactus",
          watered: true,
        };
      }

      // Place unwatered cacti
      for (
        let i = currentWatered;
        i < totalRequired && i < cactusPositions.length;
        i++
      ) {
        const pos = cactusPositions[i];
        shuffledGrid[pos] = {
          ...shuffledGrid[pos],
          type: "cactus",
          watered: false,
        };
      }

      // Fill remaining positions with TNT and empty (maintain roughly same ratio)
      const remainingPositions = positions.filter(
        (pos) => !cactusPositions.includes(pos)
      );
      remainingPositions.forEach((pos) => {
        const cellType = Math.random();
        shuffledGrid[pos] = {
          ...shuffledGrid[pos],
          type: cellType < 0.5 ? "tnt" : "empty", // 50/50 split for non-cactus cells
        };
      });

      // Update counters
      setRequiredCacti(totalRequired);
      setWateredCacti(currentWatered);

      return shuffledGrid;
    });
  };

  const handleCellClick = (cellId) => {
    if (gameOver) return;

    const cell = grid[cellId];

    // Check what user clicked on
    if (cell.type === "tnt") {
      // User watered TNT - FAIL!
      setExplosionEffect(cellId);
      setTimeout(() => {
        if (onFailure) {
          onFailure("💥 You watered a fucking TNT, are you blind?! 💥");
        } else {
          onComplete(false);
        }
      }, 1000);
      return;
    }

    if (cell.type === "empty") {
      // User watered empty desert - FAIL!
      setTimeout(() => {
        if (onFailure) {
          onFailure(
            "🏜️ You watered the fucking desert you idiot, don't you know water is precious?! 🏜️"
          );
        } else {
          onComplete(false);
        }
      }, 500);
      return;
    }

    if (cell.type === "cactus" && cell.watered) {
      // Already watered - ignore click
      return;
    }

    // Valid cactus click - water only this single cactus
    setGrid((prev) =>
      prev.map((gridCell) => {
        if (gridCell.id === cellId && gridCell.type === "cactus") {
          return { ...gridCell, watered: true };
        }
        return gridCell;
      })
    );

    // Update watered count
    setWateredCacti((prev) => prev + 1);
  };

  const checkWin = () => {
    const cactusWatered = grid.filter(
      (cell) => cell.type === "cactus" && cell.watered
    ).length;
    const totalCactus = grid.filter((cell) => cell.type === "cactus").length;
    return cactusWatered === totalCactus && totalCactus > 0;
  };

  useEffect(() => {
    if (grid.length > 0 && checkWin() && !gameOver) {
      setGameOver(true);
      setTimeout(() => onComplete(true), 1000);
    }
  }, [grid, gameOver]);

  const getCellDisplay = (cell) => {
    if (explosionEffect === cell.id) {
      return "💥";
    }

    switch (cell.type) {
      case "cactus":
        return cell.watered ? "🌵" : "🌰"; // Fully grown cactus vs seedling
      case "tnt":
        return "🧨";
      case "empty":
        return "";
      default:
        return "";
    }
  };

  const getCellColor = (cell) => {
    if (explosionEffect === cell.id) {
      return "bg-red-500 animate-pulse";
    }

    if (cell.watered && cell.type === "cactus") {
      return "bg-green-100";
    }

    if (cell.type === "tnt") {
      return "bg-red-100";
    }

    return "bg-yellow-100";
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-lg mx-4 text-center">
      <h3 className="text-xl font-bold mb-4 pixelated">💧 Sprinkler Puzzle</h3>
      <p className="text-sm mb-4 italic">
        "Water all cactus seedlings one by one! Avoid TNT and empty desert!
        🌰➡️🌵"
      </p>

      <div className="mb-4">
        <p className="text-sm">
          Cactus watered: {wateredCacti} / {requiredCacti}
        </p>
        <p className="text-xs text-red-600 mt-1">
          🧨 Avoid TNT! 🏜️ Don't waste water on desert!
        </p>
        <p className="text-xs text-orange-600">
          ⚠️ Grid shuffles every second!
        </p>
        <p className="text-xs text-blue-600">
          💧 Click each seedling to water individually!
        </p>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-4 mx-auto max-w-xs">
        {grid.map((cell) => (
          <div
            key={cell.id}
            onClick={() => handleCellClick(cell.id)}
            className={`w-12 h-12 border border-gray-300 cursor-pointer flex items-center justify-center text-lg transition-all duration-200 ${getCellColor(
              cell
            )} ${
              explosionEffect === cell.id
                ? "transform scale-150"
                : "hover:scale-105"
            }`}
          >
            {getCellDisplay(cell)}
          </div>
        ))}
      </div>

      {gameOver && checkWin() && (
        <div className="mt-4 text-green-600 font-bold animate-bounce">
          🎉 All cacti watered! Puzzle solved! 🎉
        </div>
      )}
    </div>
  );
};
