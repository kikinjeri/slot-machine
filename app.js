/* 🎰 Slot Machine Game - Web Version
   Fixed: UI/Logic mismatch (e.g., DDD row now counts as a win)
   Added: Animations, color feedback, sound support, and clean structure
*/

const SYMBOLS_COUNT = { A: 2, B: 4, C: 6, D: 8 };
const SYMBOL_VALUES = { A: 5, B: 4, C: 3, D: 2 };
const ROWS = 3;
const COLS = 3;

let balance = 0;
let lines = 1;
let bet = 0;

// 🎵 Optional sounds
const spinSound = new Audio("assets/spin.mp3");
const winSound = new Audio("assets/win.mp3");
const loseSound = new Audio("assets/lose.mp3");

document.addEventListener("DOMContentLoaded", () => {
  const balanceEl = document.getElementById("balance");
  const linesEl = document.getElementById("lines");
  const betEl = document.getElementById("bet");
  const resultEl = document.getElementById("result");
  const spinBtn = document.getElementById("spin-btn");

  balance = 100;
  balanceEl.textContent = balance.toFixed(2);

  spinBtn.addEventListener("click", () => {
    lines = parseInt(linesEl.value);
    bet = parseFloat(betEl.value);

    const totalBet = bet * lines;

    if (isNaN(bet) || bet <= 0) {
      resultEl.textContent = "Please enter a valid bet.";
      return;
    }

    if (totalBet > balance) {
      resultEl.textContent = "Insufficient balance!";
      return;
    }

    spinSound.play().catch(() => {});
    balance -= totalBet;
    balanceEl.textContent = balance.toFixed(2);

    const reels = spin();
    const rows = transpose(reels);
    displaySlots(rows);

    const winnings = getWinnings(rows, bet, lines);
    balance += winnings;
    balanceEl.textContent = balance.toFixed(2);

    if (winnings > 0) {
      winSound.play().catch(() => {});
      resultEl.textContent = `🎉 You won $${winnings}!`;
      resultEl.classList.add("win");
      resultEl.classList.remove("lose");
    } else {
      loseSound.play().catch(() => {});
      resultEl.textContent = "No win this time. Try again!";
      resultEl.classList.add("lose");
      resultEl.classList.remove("win");
    }
  });
});

function spin() {
  const symbols = [];
  for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
    for (let i = 0; i < count; i++) symbols.push(symbol);
  }

  const reels = [];
  for (let i = 0; i < COLS; i++) {
    reels.push([]);
    const reelSymbols = [...symbols];
    for (let j = 0; j < ROWS; j++) {
      const randIndex = Math.floor(Math.random() * reelSymbols.length);
      const selectedSymbol = reelSymbols[randIndex];
      reels[i].push(selectedSymbol);
      reelSymbols.splice(randIndex, 1);
    }
  }
  return reels;
}

function transpose(reels) {
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    rows.push([]);
    for (let j = 0; j < COLS; j++) {
      rows[i].push(reels[j][i]);
    }
  }
  return rows;
}

function getWinnings(rows, bet, lines) {
  let winnings = 0;

  for (let row = 0; row < lines; row++) {
    const symbols = rows[row];
    const allSame = symbols.every((s) => s === symbols[0]);
    if (allSame) winnings += bet * SYMBOL_VALUES[symbols[0]];
  }

  return winnings;
}

function displaySlots(rows) {
  const reels = document.querySelectorAll(".reel");
  reels.forEach((r) => (r.innerHTML = ""));

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const reel = document.getElementById(`reel-${col + 1}`);
      const symbolEl = document.createElement("div");
      symbolEl.textContent = rows[row][col];
      symbolEl.classList.add("symbol");
      symbolEl.style.animationDelay = `${row * 0.2}s`;
      reel.appendChild(symbolEl);
    }
  }
}
