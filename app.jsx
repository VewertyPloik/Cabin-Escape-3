import React, { useEffect, useMemo, useState } from "react";

// Cabin Escape – single-file React game
// Uses Tailwind for styling (no import needed in this environment)
// Features: Home screen, local save/load, back-to-home, inventory, item use, 6 scenes, win screen

const SAVE_KEY = "cabin-escape-save-v1";

const SCENES = {
  HOME: "home",
  DINING: "dining",
  BEDROOM: "bedroom",
  BATHROOM: "bathroom",
  BASEMENT_DOOR: "basementDoor",
  WASHING: "washing",
  EXIT: "exit",
  ESCAPED: "escaped",
};

const ITEMS = {
  COIN: { id: "coin", label: "Coin", icon: "🪙" },
  KEY: { id: "key", label: "Basement Key", icon: "🗝️" },
  KNIFE: { id: "knife", label: "Knife", icon: "🔪" },
  AXE: { id: "axe", label: "Axe", icon: "🪓" },
};

const initialState = {
  scene: SCENES.HOME,
  inventory: [], // array of item ids
  equipped: null, // item id in use
  flags: {
    sinkSearched: false,
    cushionCut: false,
    gotCoin: false,
    safeOpened: false,
    basementUnlocked: false,
    gotKnife: false,
    gotAxe: false,
    boardsCleared: false,
  },
};

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}

function useAutosave(state) {
  useEffect(() => {
    saveGame(state);
  }, [state]);
}

function Inventory({ inventory, equipped, onEquip }) {
  return (
    <div className="w-full bg-stone-800/70 text-stone-100 rounded-2xl p-3 mt-3 shadow-inner">
      <div className="text-sm mb-2 opacity-80">Inventory (tap to equip):</div>
      <div className="flex flex-wrap gap-2">
        {inventory.length === 0 && (
          <div className="text-stone-300 italic">Empty</div>
        )}
        {inventory.map((id) => (
          <button
            key={id}
            onClick={() => onEquip(equipped === id ? null : id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow transition border backdrop-blur 
              ${
                equipped === id
                  ? "bg-emerald-200 text-stone-900 border-emerald-400"
                  : "bg-stone-100 text-stone-900 border-stone-300 hover:bg-stone-200"
              }`}
            title="Click to equip / unequip"
          >
            <span className="text-xl">
              {id === ITEMS.COIN.id && ITEMS.COIN.icon}
              {id === ITEMS.KEY.id && ITEMS.KEY.icon}
              {id === ITEMS.KNIFE.id && ITEMS.KNIFE.icon}
              {id === ITEMS.AXE.id && ITEMS.AXE.icon}
            </span>
            <span className="text-sm">
              {id === ITEMS.COIN.id && ITEMS.COIN.label}
              {id === ITEMS.KEY.id && ITEMS.KEY.label}
              {id === ITEMS.KNIFE.id && ITEMS.KNIFE.label}
              {id === ITEMS.AXE.id && ITEMS.AXE.label}
            </span>
          </button>
        ))}
      </div>
      {equipped && (
        <div className="text-xs mt-2 text-stone-300">Equipped: {equipped}</div>
      )}
    </div>
  );
}

function NavArrows({ onLeft, onRight, leftEnabled, rightEnabled }) {
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 select-none">
      <button
        onClick={onLeft}
        disabled={!leftEnabled}
        className={`h-12 w-12 rounded-full shadow-lg text-2xl grid place-items-center border 
          ${leftEnabled ? "bg-white hover:scale-105" : "bg-stone-200 opacity-60"}`}
        aria-label="Go left"
      >
        ◀
      </button>
      <button
        onClick={onRight}
        disabled={!rightEnabled}
        className={`h-12 w-12 rounded-full shadow-lg text-2xl grid place-items-center border 
          ${rightEnabled ? "bg-white hover:scale-105" : "bg-stone-200 opacity-60"}`}
        aria-label="Go right"
      >
        ▶
      </button>
    </div>
  );
}

function RoomFrame({ children, wallClass = "", floorClass = "" }) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-stone-300">
      <div className={`absolute inset-0 ${wallClass}`}></div>
      {/* floor */}
      <div className={`absolute bottom-0 left-0 right-0 h-1/3 ${floorClass}`}></div>
      {children}
    </div>
  );
}

function Window({ position = "center" }) {
  const posClass =
    position === "center"
      ? "left-1/2 -translate-x-1/2"
      : position === "left"
      ? "left-10"
      : "right-10";
  return (
    <div className={`absolute top-10 ${posClass} w-48 h-32 bg-sky-200/60 border-4 border-sky-300 rounded-xl backdrop-blur-sm`}> 
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/40 to-sky-300/40"></div>
      <div className="absolute inset-x-0 top-1/2 h-1 bg-sky-400/60"></div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1 h-full bg-sky-400/60"></div>
    </div>
  );
}

function TableAndChairs({ onCutCushion, cushionCut }) {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[520px] h-36">
      {/* table */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[420px] h-20 bg-amber-200 border-4 border-amber-300 rounded-xl shadow-inner"></div>
      {/* chair left */}
      <div className="absolute left-0 bottom-0 w-40 h-24">
        <div className="w-full h-5 bg-amber-300 rounded-md"></div>
        <div className="w-full h-16 bg-amber-200 border-4 border-amber-300 rounded-b-xl"></div>
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-10 bg-red-500 rounded-md shadow cursor-default"></div>
      </div>
      {/* chair right with cushion to cut */}
      <button
        onClick={onCutCushion}
        className="absolute right-0 bottom-0 w-40 h-24 group"
        title={
          cushionCut
            ? "You already cut this cushion."
            : "Use 🔪 on this cushion to see what's inside"
        }
      >
        <div className="w-full h-5 bg-amber-300 rounded-md"></div>
        <div className="w-full h-16 bg-amber-200 border-4 border-amber-300 rounded-b-xl"></div>
        <div className={`absolute top-5 left-1/2 -translate-x-1/2 w-32 h-10 rounded-md shadow transition 
          ${cushionCut ? "bg-red-300" : "bg-red-500 group-hover:bg-red-400"}`}></div>
        {!cushionCut && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-white px-2 py-1 rounded shadow opacity-90">
            Tip: equip 🔪 and tap cushion
          </div>
        )}
      </button>
    </div>
  );
}

function ShelfWithSafe({ onUseCoin, safeOpened }) {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 h-40">
      {/* 3-level shelf */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-full h-10 mb-3 bg-amber-200 border-4 border-amber-300 rounded-lg shadow"
        ></div>
      ))}
      {/* safe on level 3 */}
      <button
        onClick={onUseCoin}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-40 h-24 bg-stone-500 border-4 border-stone-600 rounded-lg shadow text-stone-100 flex items-center justify-center"
        title={safeOpened ? "Safe opened" : "Coin-shaped lock…"}
      >
        <div className="text-2xl">{safeOpened ? "✓" : ITEMS.COIN.icon}</div>
      </button>
    </div>
  );
}

function BathroomSet({ onTapSink, sinkSearched }) {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[600px] h-40">
      {/* sink */}
      <button
        onClick={onTapSink}
        className="absolute left-10 bottom-10 w-40 h-24 bg-slate-200 border-4 border-slate-300 rounded-xl shadow grid place-items-center"
        title={sinkSearched ? "You found the 🗝️ already" : "Tap sink"}
      >
        <div className="text-sm opacity-70">Sink</div>
      </button>
      {/* toilet */}
      <div className="absolute left-60 bottom-10 w-28 h-24 bg-slate-200 border-4 border-slate-300 rounded-xl shadow grid place-items-center">
        <div className="text-sm opacity-70">Toilet</div>
      </div>
      {/* shower */}
      <div className="absolute right-10 bottom-10 w-36 h-28 bg-slate-200 border-4 border-slate-300 rounded-xl shadow grid place-items-center">
        <div className="text-sm opacity-70">Shower</div>
      </div>
    </div>
  );
}

function BasementDoor({ unlocked, onUseKey }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-52 h-48">
      <button
        onClick={onUseKey}
        className={`w-full h-full rounded-xl border-4 shadow grid place-items-center text-sm 
          ${unlocked ? "bg-amber-700 border-amber-800 text-amber-100" : "bg-amber-700 border-amber-900 text-amber-100"}`}
        title={unlocked ? "Basement unlocked" : "Locked – maybe a key?"}
      >
        <div>{unlocked ? "Unlocked" : "Basement Door (Locked)"}</div>
      </button>
    </div>
  );
}

function WashingRoom({ gotKnife, onPickupKnife }) {
  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[680px] h-48">
      {/* washer & dryer */}
      <div className="absolute left-8 bottom-8 w-40 h-32 bg-slate-200 border-4 border-slate-300 rounded-xl shadow grid place-items-center">
        <div className="text-xs opacity-70">Washer</div>
      </div>
      <div className="absolute left-56 bottom-8 w-40 h-32 bg-slate-200 border-4 border-slate-300 rounded-xl shadow grid place-items-center">
        <div className="text-xs opacity-70">Dryer</div>
      </div>
      {/* table */}
      <div className="absolute right-8 bottom-8 w-56 h-28 bg-amber-200 border-4 border-amber-300 rounded-xl shadow grid place-items-center">
        <div className="text-xs opacity-70">Table</div>
      </div>
      {/* knife on table */}
      {!gotKnife && (
        <button
          onClick={onPickupKnife}
          className="absolute right-20 bottom-16 text-2xl hover:scale-110 transition"
          title="Pick up 🔪"
        >
          {ITEMS.KNIFE.icon}
        </button>
      )}
    </div>
  );
}

function BoardedExit({ boardsCleared, onUseAxe }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-72 h-48">
      {/* opening */}
      <div className="absolute inset-0 bg-slate-900/80 rounded-xl border-4 border-slate-800"></div>
      {/* boards */}
      {!boardsCleared && (
        <button
          onClick={onUseAxe}
          className="absolute inset-4 rounded-lg grid place-items-center bg-[repeating-linear-gradient(45deg,#8b5a2b_0px,#8b5a2b_12px,#6b4423_12px,#6b4423_24px)] border-4 border-amber-900 text-amber-50 text-sm shadow"
          title="Use 🪓 to break the boards"
        >
          Blocked Exit (Boards)
        </button>
      )}
      {boardsCleared && (
        <div className="absolute inset-0 grid place-items-center text-emerald-100 text-lg">
          Exit Open!
        </div>
      )}
    </div>
  );
}

function HUD({ onHome, onReset, canContinue }) {
  return (
    <div className="flex items-center justify-between w-full mb-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onHome}
          className="px-3 py-2 rounded-xl bg-white border shadow hover:scale-105 transition"
        >
          ⬅ Back to Home
        </button>
      </div>
      <div className="text-stone-600 text-sm">Cabin Escape</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-xl bg-white border shadow hover:scale-105 transition"
          title="Clear save and restart"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function CabinEscape() {
  const [state, setState] = useState(() => loadGame() || initialState);
  useAutosave(state);

  const setScene = (scene) => setState((s) => ({ ...s, scene }));
  const addItem = (id) =>
    setState((s) => {
      if (s.inventory.includes(id)) return s;
      return { ...s, inventory: [...s.inventory, id] };
    });
  const removeItem = (id) =>
    setState((s) => ({ ...s, inventory: s.inventory.filter((x) => x !== id) }));
  const equip = (id) => setState((s) => ({ ...s, equipped: id }));
  const setFlag = (key, val) => setState((s) => ({ ...s, flags: { ...s.flags, [key]: val } }));

  const leftRight = useMemo(() => {
    const { scene, flags } = state;
    const map = {
      [SCENES.DINING]: { left: SCENES.BEDROOM, right: SCENES.BASEMENT_DOOR },
      [SCENES.BEDROOM]: { left: SCENES.BATHROOM, right: SCENES.DINING },
      [SCENES.BATHROOM]: { left: null, right: SCENES.BEDROOM },
      [SCENES.BASEMENT_DOOR]: { left: SCENES.DINING, right: flags.basementUnlocked ? SCENES.WASHING : null },
      [SCENES.WASHING]: { left: SCENES.BASEMENT_DOOR, right: SCENES.EXIT },
      [SCENES.EXIT]: { left: SCENES.WASHING, right: null },
    };
    return map[scene] || { left: null, right: null };
  }, [state.scene, state.flags.basementUnlocked]);

  // actions
  const tapSink = () => {
    if (!state.flags.sinkSearched) {
      setFlag("sinkSearched", true);
      if (!state.inventory.includes(ITEMS.KEY.id)) {
        addItem(ITEMS.KEY.id);
      }
    }
  };

  const cutCushion = () => {
    if (state.scene !== SCENES.DINING) return;
    if (state.flags.cushionCut) return;
    if (state.equipped === ITEMS.KNIFE.id) {
      setFlag("cushionCut", true);
      if (!state.flags.gotCoin) {
        addItem(ITEMS.COIN.id);
        setFlag("gotCoin", true);
      }
    }
  };

  const useKeyOnDoor = () => {
    if (state.flags.basementUnlocked) return;
    if (state.equipped === ITEMS.KEY.id) {
      setFlag("basementUnlocked", true);
      // keep key in inventory for simplicity
    }
  };

  const pickupKnife = () => {
    if (!state.flags.gotKnife) {
      addItem(ITEMS.KNIFE.id);
      setFlag("gotKnife", true);
    }
  };

  const useCoinOnSafe = () => {
    if (state.flags.safeOpened) return;
    if (state.equipped === ITEMS.COIN.id) {
      setFlag("safeOpened", true);
      if (!state.flags.gotAxe) {
        addItem(ITEMS.AXE.id);
        setFlag("gotAxe", true);
      }
    }
  };

  const useAxeOnBoards = () => {
    if (state.flags.boardsCleared) return;
    if (state.equipped === ITEMS.AXE.id) {
      setFlag("boardsCleared", true);
      setTimeout(() => setScene(SCENES.ESCAPED), 450);
    }
  };

  const resetGame = () => {
    clearSave();
    setState(initialState);
  };

  const startNew = () => setScene(SCENES.DINING);
  const continueGame = () => setScene(loadGame()?.scene || SCENES.DINING);

  // shared wrappers
  const AppShell = ({ children }) => (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-100 to-stone-300 p-4">
      <div className="max-w-5xl mx-auto">
        <HUD onHome={() => setScene(SCENES.HOME)} onReset={resetGame} />
        <div className="rounded-3xl p-4 bg-white/70 backdrop-blur border shadow-xl">
          {children}
        </div>
        <Inventory
          inventory={state.inventory}
          equipped={state.equipped}
          onEquip={equip}
        />
        <div className="mt-3 text-xs text-stone-500">Progress auto-saved locally.</div>
      </div>
    </div>
  );

  // Scene components
  const Home = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-900 to-stone-700 text-stone-100">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="text-4xl font-bold mb-2">Cabin Escape</div>
        <div className="opacity-80 mb-8">Find your way out using items hidden around the rooms.</div>
        <div className="grid gap-3 max-w-sm">
          <button
            onClick={startNew}
            className="px-6 py-3 rounded-2xl bg-emerald-400 text-stone-900 font-semibold shadow hover:scale-105 transition"
          >
            New Game
          </button>
          <button
            onClick={continueGame}
            className="px-6 py-3 rounded-2xl bg-white text-stone-900 font-semibold shadow hover:scale-105 transition"
          >
            Continue
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-3 rounded-2xl bg-stone-200 text-stone-900 font-semibold shadow hover:scale-105 transition"
          >
            Reset Save
          </button>
        </div>
        <div className="mt-10 text-sm opacity-80">
          Tips: Tap items to pick them up. Tap an item in your inventory to equip it, then tap objects in rooms to use it.
        </div>
      </div>
    </div>
  );

  const Dining = () => (
    <AppShell>
      <div className="mb-2 text-lg font-semibold">Scene 1 – Dining Room</div>
      <div className="mb-4 text-sm opacity-80">Brown wall, 1 centered window, light brown table & chairs, red cushions. Use 🔪 on a cushion to reveal something.</div>
      <div className="relative">
        <RoomFrame wallClass="bg-gradient-to-br from-amber-900 to-amber-700" floorClass="bg-[repeating-linear-gradient(0deg,#d6b581_0px,#d6b581_16px,#caa86d_16px,#caa86d_32px)]">
          <Window position="center" />
          <TableAndChairs onCutCushion={cutCushion} cushionCut={state.flags.cushionCut} />
          <NavArrows
            onLeft={() => setScene(leftRight.left)}
            onRight={() => setScene(leftRight.right)}
            leftEnabled={!!leftRight.left}
            rightEnabled={!!leftRight.right}
          />
        </RoomFrame>
      </div>
      <ContextBar state={state} />
    </AppShell>
  );

  const Bedroom = () => (
    <AppShell>
      <div className="mb-2 text-lg font-semibold">Scene 2 – Bedroom 1</div>
      <div className="mb-4 text-sm opacity-80">Light gray wall, centered window, a 3-level shelf with a dark gray safe on level 3 that has a coin-shaped lock.</div>
      <div className="relative">
        <RoomFrame wallClass="bg-gradient-to-br from-stone-300 to-stone-200" floorClass="bg-[repeating-linear-gradient(0deg,#d6b581_0px,#d6b581_16px,#caa86d_16px,#caa86d_32px)]">
          <Window position="center" />
          <ShelfWithSafe onUseCoin={useCoinOnSafe} safeOpened={state.flags.safeOpened} />
          <NavArrows
            onLeft={() => setScene(leftRight.left)}
            onRight={() => setScene(leftRight.right)}
            leftEnabled={!!leftRight.left}
            rightEnabled={!!leftRight.right}
          />
        </RoomFrame>
      </div>
      <ContextBar state={state} />
    </AppShell>
  );

  const Bathroom = () => (
    <AppShell>
      <div className="mb-2 text-lg font-semibold">Scene 3 – Bathroom</div>
      <div className="mb-4 text-sm opacity-80">Dark blue wall, centered window, shower, toilet, sink. Tap the sink to find the basement key.</div>
      <div className="relative">
        <RoomFrame wallClass="bg-gradient-to-br from-blue-900 to-blue-700" floorClass="bg-[repeating-linear-gradient(0deg,#d6b581_0px,#d6b581_16px,#caa86d_16px,#caa86d_32px)]">
          <Window position="center" />
          <BathroomSet onTapSink={tapSink} sinkSearched={state.flags.sinkSearched} />
          <NavArrows
            onLeft={() => setScene(leftRight.left)}
            onRight={() => setScene(leftRight.right)}
            leftEnabled={!!leftRight.left}
            rightEnabled={!!leftRight.right}
          />
        </RoomFrame>
      </div>
      <ContextBar state={state} />
    </AppShell>
  );

  const BasementDoorScene = () => (
    <AppShell>
      <div className="mb-2 text-lg font-semibold">Scene 4 – Basement Door</div>
      <div className="mb-4 text-sm opacity-80">Gray wall, no windows, a brown basement door. It's locked until you unlock it with a key.</div>
      <div className="relative">
        <RoomFrame wallClass="bg-gradient-to-br from-stone-400 to-stone-300" floorClass="bg-[repeating-linear-gradient(0deg,#d6b581_0px,#d6b581_16px,#caa86d_16px,#caa86d_32px)]">
          <BasementDoor unlocked={state.flags.basementUnlocked} onUseKey={useKeyOnDoor} />
          <NavArrows
            onLeft={() => setScene(leftRight.left)}
            onRight={() => setScene(leftRight.right)}
            leftEnabled={!!leftRight.left}
            rightEnabled={!!leftRight.right}
          />
        </RoomFrame>
      </div>
      <ContextBar state={state} />
    </AppShell>
  );

  const Washing = () => (
    <AppShell>
      <div className="mb-2 text-lg font-semibold">Scene 5 – Basement Washing Room</div>
      <div className="mb-4 text-sm opacity-80">Gray wall, washer & dryer, a brown table with a knife on it. Pick up the 🔪, then use it on the dining chair cushion to get the 🪙. Use the 🪙 on the safe to get the 🪓.</div>
      <div className="relative">
        <RoomFrame wallClass="bg-gradient-to-br from-stone-500 to-stone-400" floorClass="bg-[repeating-linear-gradient(0deg,#b7b7b7_0px,#b7b7b7_16px,#a7a7a7_16px,#a7a7a7_32px)]">
          <WashingRoom gotKnife={state.flags.gotKnife} onPickupKnife={pickupKnife} />
          <NavArrows
            onLeft={() => setScene(leftRight.left)}
            onRight={() => setScene(leftRight.right)}
            leftEnabled={!!leftRight.left}
            rightEnabled={!!leftRight.right}
          />
        </RoomFrame>
      </div>
      <ContextBar state={state} />
    </AppShell>
  );

  const Exit = () => (
    <AppShell>
      <div className="mb-2 text-lg font-semibold">Scene 6 – Blocked Exit</div>
      <div className="mb-4 text-sm opacity-80">Gray wall with a boarded-up exit. Use the 🪓 to break the boards and escape.</div>
      <div className="relative">
        <RoomFrame wallClass="bg-gradient-to-br from-stone-600 to-stone-500" floorClass="bg-[repeating-linear-gradient(0deg,#b7b7b7_0px,#b7b7b7_16px,#a7a7a7_16px,#a7a7a7_32px)]">
          <BoardedExit boardsCleared={state.flags.boardsCleared} onUseAxe={useAxeOnBoards} />
          <NavArrows
            onLeft={() => setScene(leftRight.left)}
            onRight={() => setScene(leftRight.right)}
            leftEnabled={!!leftRight.left}
            rightEnabled={!!leftRight.right}
          />
        </RoomFrame>
      </div>
      <ContextBar state={state} />
    </AppShell>
  );

  const Escaped = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-100 to-emerald-300">
      <div className="max-w-3xl mx-auto py-16 px-6 text-center">
        <div className="text-4xl font-bold text-emerald-900 mb-2">You Escaped! 🎉</div>
        <div className="text-emerald-800 mb-8">Nice work. You found the tools and made it out of the cabin.</div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setScene(SCENES.DINING)}
            className="px-6 py-3 rounded-2xl bg-white text-stone-900 font-semibold shadow hover:scale-105 transition"
          >
            Play Again
          </button>
          <button
            onClick={() => setScene(SCENES.HOME)}
            className="px-6 py-3 rounded-2xl bg-stone-900 text-white font-semibold shadow hover:scale-105 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Small helper: shows context hints based on equipment
  function ContextBar({ state }) {
    const { equipped } = state;
    let hint = "";
    if (!equipped) hint = "Equip an item to use it on objects.";
    if (equipped === ITEMS.KEY.id) hint = "Try the key on the basement door.";
    if (equipped === ITEMS.KNIFE.id) hint = "Cut the red cushion in the Dining Room.";
    if (equipped === ITEMS.COIN.id) hint = "Use the coin on the Bedroom safe.";
    if (equipped === ITEMS.AXE.id) hint = "Break the boards at the Exit.";
    return (
      <div className="mt-3 text-sm text-stone-700">
        {hint}
      </div>
    );
  }

  // Router
  switch (state.scene) {
    case SCENES.HOME:
      return <Home />;
    case SCENES.DINING:
      return <Dining />;
    case SCENES.BEDROOM:
      return <Bedroom />;
    case SCENES.BATHROOM:
      return <Bathroom />;
    case SCENES.BASEMENT_DOOR:
      return <BasementDoorScene />;
    case SCENES.WASHING:
      return <Washing />;
    case SCENES.EXIT:
      return <Exit />;
    case SCENES.ESCAPED:
      return <Escaped />;
    default:
      return <Home />;
  }
}
