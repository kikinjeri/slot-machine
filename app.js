// 🎰 Slot Machine Game Script
const SYMBOLS_COUNT = { A: 2, B: 4, C: 6, D: 8 };
const SYMBOL_VALUES = { A: 5, B: 4, C: 3, D: 2 };
const ROWS = 3;
const COLS = 3;

let balance = 0;
let bet = 0;

// Optional sounds
// Ensure these paths are correct, or comment out if you don't have the files
const spinSound = new Audio("assets/spin.mp3"); 
const winSound = new Audio("assets/win.mp3");
const loseSound = new Audio("assets/lose.mp3");

document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  const balanceEl = document.getElementById("balance");
  const betEl = document.getElementById("bet");
  const resultEl = document.getElementById("result");
  const spinBtn = document.getElementById("spin-btn");
  const depositBtn = document.getElementById("deposit-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const depositInput = document.getElementById("deposit");
  
  // Modal References
  const paytableBtn = document.getElementById("paytable-btn");
  const modal = document.getElementById("paytable-modal");
  const closeBtn = document.querySelector(".close-btn");

  balanceEl.textContent = balance.toFixed(2);
  playAgainBtn.style.display = "none";

  // --- Deposit Handler ---
  depositBtn.addEventListener("click", () => {
    const depositAmount = parseFloat(depositInput.value);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      resultEl.textContent = "Please enter a valid deposit amount.";
      resultEl.className = "lose";
      return;
    }

    if (depositAmount > 500) {
      resultEl.textContent = "Deposit limit is $500 maximum.";
      resultEl.className = "lose";
      return;
    }

    balance += depositAmount;
    balanceEl.textContent = balance.toFixed(2);
    depositInput.value = "";
    resultEl.textContent = `✅ Deposited $${depositAmount.toFixed(2)} successfully!`;
    resultEl.className = "win";
  });

  // --- Spin Handler ---
  spinBtn.addEventListener("click", () => {
    bet = parseFloat(betEl.value);

    if (isNaN(bet) || bet <= 0) {
      resultEl.textContent = "Please enter a valid bet.";
      resultEl.className = "lose";
      return;
    }

    if (bet > balance) {
      resultEl.textContent = "Insufficient balance!";
      resultEl.className = "lose";
      return;
    }

    spinBtn.disabled = true;
    spinSound.play().catch(() => {});
    balance -= bet;
    balanceEl.textContent = balance.toFixed(2);

    const reels = spin();
    const rows = transpose(reels);
    displaySlots(rows);

    const winnings = getWinnings(rows, bet);
    balance += winnings;
    balanceEl.textContent = balance.toFixed(2);

    setTimeout(() => {
      if (winnings > 0) {
        winSound.play().catch(() => {});
        resultEl.textContent = `🎉 You won $${winnings.toFixed(2)}!`;
        resultEl.className = "win";
      } else {
        loseSound.play().catch(() => {});
        resultEl.textContent = "No win this time. Try again!";
        resultEl.className = "lose";
      }

      playAgainBtn.style.display = "inline-block";
      spinBtn.style.display = "none";
      spinBtn.disabled = false;
    }, 800);
  });

  // --- Play Again Handler ---
  playAgainBtn.addEventListener("click", () => {
    resultEl.textContent = "";
    playAgainBtn.style.display = "none";
    spinBtn.style.display = "inline-block";
  });

  // --- Modal Event Handlers ---
  paytableBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

// ===================================================
// --- Game Logic Functions ---
// ===================================================

/**
 * Generates the outcome for all reels based on the symbol weights.
 *
 * FIX: This function uses the corrected logic: symbols are selected
 * independently for each slot position from the full weighted pool.
 */
function spin() {
  // 1. Create the full weighted symbol pool 
  const symbols = [];
  for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
    for (let i = 0; i < count; i++) symbols.push(symbol);
  }

  const reels = [];
  // 2. Iterate through each column (reel)
  for (let i = 0; i < COLS; i++) {
    reels.push([]);

    // 3. Select symbols for the current reel's rows
    for (let j = 0; j < ROWS; j++) {
      // Select a random symbol from the full weighted pool
      const randIndex = Math.floor(Math.random() * symbols.length);
      const selectedSymbol = symbols[randIndex];
      reels[i].push(selectedSymbol);
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

function getWinnings(rows, bet) {
  let winnings = 0;
  // Check for winning lines in each row
  for (let row = 0; row < ROWS; row++) {
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