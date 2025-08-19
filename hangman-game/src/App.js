import { useEffect, useMemo, useState } from "react";

// ---------------------------
// Enhanced Hangman – React + Tailwind with Dark Colors Throughout
// Fully Responsive for Mobile + Desktop
// ---------------------------

const DIFFICULTY_SETTINGS = {
  Easy: { lives: 8, min: 3, max: 6 },
  Medium: { lives: 7, min: 5, max: 9 },
  Hard: { lives: 6, min: 7, max: 12 },
};

const TIMER_DURATION = 60; // seconds per round

function useKeydown(handler) {
  useEffect(() => {
    const f = (e) => handler(e);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [handler]);
}

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function HangmanFigure({ wrong }) {
  const stage = Math.max(0, Math.min(wrong, 7));
  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-gray-900/60 to-black/80 rounded-2xl p-6 border border-gray-800/60 shadow-2xl">
      <svg
        viewBox="0 0 200 250"
        className="w-32 sm:w-40 lg:w-48 h-36 sm:h-48 text-yellow-700 drop-shadow-lg"
      >
        {/* Ground + Gallows with enhanced styling */}
        <line
          x1="10"
          y1="240"
          x2="160"
          y2="240"
          strokeWidth="8"
          stroke="currentColor"
          className="drop-shadow-md"
        />
        <line
          x1="40"
          y1="240"
          x2="40"
          y2="20"
          strokeWidth="8"
          stroke="currentColor"
          className="drop-shadow-md"
        />
        <line
          x1="40"
          y1="20"
          x2="130"
          y2="20"
          strokeWidth="8"
          stroke="currentColor"
          className="drop-shadow-md"
        />
        <line
          x1="130"
          y1="20"
          x2="130"
          y2="50"
          strokeWidth="6"
          stroke="currentColor"
          className="drop-shadow-md"
        />

        {/* Enhanced figure parts with darker colors */}
        {stage > 0 && (
          <circle
            cx="130"
            cy="70"
            r="20"
            stroke="#a16207"
            strokeWidth="5"
            fill="none"
          />
        )}
        {stage > 1 && (
          <line
            x1="130"
            y1="90"
            x2="130"
            y2="140"
            strokeWidth="5"
            stroke="#a16207"
          />
        )}
        {stage > 2 && (
          <line
            x1="130"
            y1="105"
            x2="110"
            y2="125"
            strokeWidth="5"
            stroke="#7f1d1d"
          />
        )}
        {stage > 3 && (
          <line
            x1="130"
            y1="105"
            x2="150"
            y2="125"
            strokeWidth="5"
            stroke="#7f1d1d"
          />
        )}
        {stage > 4 && (
          <line
            x1="130"
            y1="140"
            x2="115"
            y2="170"
            strokeWidth="5"
            stroke="#7f1d1d"
          />
        )}
        {stage > 5 && (
          <line
            x1="130"
            y1="140"
            x2="145"
            y2="170"
            strokeWidth="5"
            stroke="#7f1d1d"
          />
        )}
        {stage > 6 && (
          <g>
            <line
              x1="122"
              y1="62"
              x2="128"
              y2="68"
              strokeWidth="3"
              stroke="#7f1d1d"
            />
            <line
              x1="128"
              y1="62"
              x2="122"
              y2="68"
              strokeWidth="3"
              stroke="#7f1d1d"
            />
            <line
              x1="132"
              y1="62"
              x2="138"
              y2="68"
              strokeWidth="3"
              stroke="#7f1d1d"
            />
            <line
              x1="138"
              y1="62"
              x2="132"
              y2="68"
              strokeWidth="3"
              stroke="#7f1d1d"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export default function Hangman() {
  const [difficulty, setDifficulty] = useState("Medium");
  const [secret, setSecret] = useState("");
  const [guessed, setGuessed] = useState(() => new Set());
  const [wrong, setWrong] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | playing | won | lost
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  const settings = DIFFICULTY_SETTINGS[difficulty];
  const maxWrong = settings.lives;

  const normalizedSecret = useMemo(() => secret.toUpperCase(), [secret]);

  const display = useMemo(() => {
    return normalizedSecret
      .split("")
      .map((ch) => (ch === " " ? " " : guessed.has(ch) ? ch : "_"))
      .join(" ");
  }, [normalizedSecret, guessed]);

  useEffect(() => {
    if (status !== "playing") return;
    if (timeLeft <= 0) handleLoss();
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [status, timeLeft]);

  const startGame = async () => {
    try {
      const res = await fetch(
        "https://random-word-api.herokuapp.com/word?number=1"
      );
      const data = await res.json();
      setSecret(String(data[0] || "developer"));
    } catch {
      setSecret("developer");
    }
    setGuessed(new Set());
    setWrong(0);
    setStatus("playing");
    setTimeLeft(TIMER_DURATION);
  };

  const handleGuess = (letter) => {
    if (status !== "playing") return;
    letter = letter.toUpperCase();
    if (guessed.has(letter)) return;

    setGuessed((prev) => {
      const next = new Set(prev);
      next.add(letter);
      return next;
    });

    if (!normalizedSecret.includes(letter)) {
      setWrong((w) => {
        const nw = w + 1;
        if (nw >= maxWrong) handleLoss();
        return nw;
      });
    } else {
      const lettersOnly = new Set(
        normalizedSecret.replaceAll(" ", "").split("")
      );
      const allFound = Array.from(lettersOnly).every(
        (ch) => guessed.has(ch) || ch === letter
      );
      if (allFound) {
        setStatus("won");
        setWins((x) => x + 1);
      }
    }
  };

  const handleLoss = () => {
    setStatus("lost");
    setLosses((x) => x + 1);
  };

  useKeydown((e) => {
    if (/^[a-zA-Z]$/.test(e.key)) handleGuess(e.key);
    if (e.key === "Enter" && status !== "playing") startGame();
  });

  // Enhanced timer color based on time left - all dark colors
  const getTimerColor = () => {
    if (timeLeft > 40) return "text-green-700";
    if (timeLeft > 20) return "text-yellow-700";
    if (timeLeft > 10) return "text-orange-700";
    return "text-red-700";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid gap-6">
        {/* Enhanced Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl p-4 border border-gray-700/40 shadow-xl">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent tracking-tight text-center sm:text-left">
            Hangman
          </h1>
          <div className="flex items-center gap-3 text-sm sm:text-base">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-green-800/80 to-green-700/80 text-gray-200 font-semibold shadow-lg border border-green-700/40">
              🏆 Wins: {wins}
            </span>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-red-800/80 to-red-700/80 text-gray-200 font-semibold shadow-lg border border-red-700/40">
              💀 Losses: {losses}
            </span>
          </div>
        </header>

        {/* Enhanced Main Game Area */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700/60 backdrop-blur-sm">
          {/* Enhanced Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-gray-400 font-medium">Difficulty:</label>
              <select
                className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/60 rounded-xl px-4 py-2 text-sm sm:text-base text-gray-300 focus:ring-2 focus:ring-blue-700/60 focus:border-blue-700/60 transition-all shadow-lg"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={status === "playing"}
              >
                {Object.keys(DIFFICULTY_SETTINGS).map((d) => (
                  <option key={d} value={d} className="bg-gray-800">
                    {d} ({DIFFICULTY_SETTINGS[d].lives} lives)
                  </option>
                ))}
              </select>
            </div>

            {status !== "playing" ? (
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-blue-700 hover:from-green-800 hover:to-blue-800 text-gray-200 font-bold shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl border border-green-600/40"
              >
                ✨ {secret ? "Play Again" : "Start Game"}
              </button>
            ) : (
              <button
                onClick={handleLoss}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-gray-200 font-bold shadow-xl transform transition-all hover:scale-105 border border-red-600/40"
              >
                🏳️ Give Up
              </button>
            )}
          </div>

          {/* Enhanced Game Display */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <HangmanFigure wrong={wrong} />

            <div className="flex-1 space-y-6">
              {/* Enhanced Word Display */}
              <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-2xl p-6 border border-gray-600/50 shadow-lg">
                <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-2">
                  🎯 Target Word
                </p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-mono tracking-wider select-none break-words bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">
                  {status === "lost"
                    ? normalizedSecret.split("").join(" ")
                    : display}
                </p>
              </div>

              {/* Enhanced Game Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-xl p-4 border border-gray-600/50">
                  <p className="text-xs uppercase tracking-widest text-red-500 font-semibold mb-1">
                    Wrong Guesses
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {wrong} / {maxWrong}
                  </p>
                </div>

                {status === "playing" && (
                  <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-xl p-4 border border-gray-600/50">
                    <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-1">
                      Time Left
                    </p>
                    <p className={`text-2xl font-bold ${getTimerColor()}`}>
                      ⏰ {timeLeft}s
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Status Messages */}
              {status === "won" && (
                <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-green-800/30 to-blue-800/30 border border-green-700/50 text-green-300 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="font-bold text-lg">Congratulations!</p>
                      <p className="text-sm opacity-90">
                        You guessed the word correctly!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "lost" && (
                <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-800/30 to-red-700/30 border border-red-700/50 text-red-300 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <p className="font-bold text-lg">Game Over!</p>
                      <p className="text-sm opacity-90">
                        The word was:{" "}
                        <span className="font-bold text-yellow-400">
                          {normalizedSecret}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "idle" && (
                <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-800/30 to-purple-800/30 border border-blue-700/50 text-blue-300 shadow-lg text-center">
                  <p className="font-semibold">
                    🎮 Press "Start Game" to begin your adventure!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Letter Grid */}
          <div className="mt-8 grid grid-cols-7 sm:grid-cols-10 gap-3">
            {LETTERS.map((L) => {
              const used = guessed.has(L);
              const wrongPick = used && !normalizedSecret.includes(L);
              const correctPick = used && normalizedSecret.includes(L);

              return (
                <button
                  key={L}
                  disabled={used || status !== "playing"}
                  onClick={() => handleGuess(L)}
                  className={[
                    "h-12 rounded-xl text-sm sm:text-base font-bold transition-all duration-200 border-2 shadow-lg transform",
                    used
                      ? "cursor-not-allowed"
                      : "hover:scale-110 hover:shadow-xl active:scale-95",
                    wrongPick
                      ? "bg-gradient-to-br from-red-800/40 to-red-700/40 border-red-600/60 text-red-300"
                      : correctPick
                      ? "bg-gradient-to-br from-green-800/40 to-green-700/40 border-green-600/60 text-green-300"
                      : used
                      ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600/60 text-gray-500 opacity-50"
                      : "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600/60 text-gray-300 hover:from-gray-700 hover:to-gray-600 hover:border-blue-600/60 hover:text-blue-300",
                  ].join(" ")}
                >
                  {L}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="text-center text-sm text-gray-500 py-4 bg-gray-800/40 rounded-xl border border-gray-700/40">
          <p>🎮 Built with ❤️ for fun • Words powered by Random Word API</p>
          <p className="text-xs mt-1 text-gray-600">
            Press Enter to start a new game • Use keyboard to guess letters
          </p>
        </footer>
      </div>
    </div>
  );
}
