// Game Constants
const ROWS = 3;
const COLS = 3;
const SYMBOLS_COUNT = {
    A: 2,
    B: 4,
    C: 6,
    D: 8
};

const SYMBOL_VALUES = {
    A: 5,
    B: 4,
    C: 3,
    D: 2
};

// Game State
let balance = 0;
let lines = 1;
let bet = 0;

// DOM Elements
const balanceDisplay = document.getElementById('balance-display');
const winningsDisplay = document.getElementById('winnings-display');
const depositSection = document.getElementById('deposit-section');
const bettingSection = document.getElementById('betting-section');
const depositInput = document.getElementById('deposit-amount');
const depositBtn = document.getElementById('deposit-btn');
const linesInput = document.getElementById('lines');
const betInput = document.getElementById('bet');
const spinBtn = document.getElementById('spin-btn');
const gameMessage = document.getElementById('game-message');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// Helper Functions
const updateBalanceDisplay = () => {
    balanceDisplay.textContent = `$${balance}`;
};

const showMessage = (msg, type = 'info') => {
    gameMessage.textContent = msg;
    gameMessage.style.color = type === 'error' ? 'var(--error-color)' :
        type === 'success' ? 'var(--success-color)' :
            'var(--text-color)';
};

// Game Logic
const spin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }

    // Each nested array is a column (reel)
    const columns = [];
    for (let i = 0; i < COLS; i++) {
        columns.push([]);
        const reelSymbols = [...symbols];
        for (let j = 0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            columns[i].push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
    }
    return columns;
};

const transpose = (reels) => {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
        rows.push([]);
        for (let j = 0; j < COLS; j++) {
            rows[i].push(reels[j][i]);
        }
    }
    return rows;
};

const getWinnings = (rows, bet, lines) => {
    let winnings = 0;
    // only check the number of lines the user bet on
    // lines are top to bottom (0 to lines-1)
    for (let row = 0; row < lines; row++) {
        const symbols = rows[row];
        let allSame = true;

        for (const symbol of symbols) {
            if (symbol !== symbols[0]) {
                allSame = false;
                break;
            }
        }

        if (allSame) {
            winnings += SYMBOL_VALUES[symbols[0]] * bet;
        }
    }
    return winnings;
};

// UI Logic
const handleDeposit = () => {
    const amount = parseFloat(depositInput.value);
    if (isNaN(amount) || amount <= 0) {
        showMessage('Invalid deposit amount', 'error');
        return;
    }

    balance += amount;
    updateBalanceDisplay();
    depositInput.value = '';
    depositSection.classList.add('hidden');
    bettingSection.classList.remove('hidden');
    showMessage('Place your bet!');
};

const animateReels = (finalReels) => {
    return new Promise((resolve) => {
        spinBtn.disabled = true;
        showMessage('Spinning...');

        // Simple visual update for now
        // In a clearer implementation, we might scroll the DOM elements
        // Here we'll just update the text content after a delay for each reel

        reels.forEach((reelEl, i) => {
            // Clear current
            reelEl.innerHTML = `
                <div class="symbol">?</div>
                <div class="symbol">?</div>
                <div class="symbol">?</div>
            `;

            setTimeout(() => {
                const colSymbols = finalReels[i];
                reelEl.innerHTML = ''; // Clear placeholders
                colSymbols.forEach(sym => {
                    const symbolDiv = document.createElement('div');
                    symbolDiv.className = 'symbol';
                    symbolDiv.textContent = sym;
                    reelEl.appendChild(symbolDiv);
                });
            }, (i + 1) * 500); // 500ms delay between reels stopping
        });

        setTimeout(() => {
            spinBtn.disabled = false;
            resolve();
        }, COLS * 500 + 100);
    });
};

const handleSpin = async () => {
    const linesCount = parseInt(linesInput.value);
    const betAmount = parseFloat(betInput.value);

    if (isNaN(linesCount) || linesCount < 1 || linesCount > 3) {
        showMessage('Invalid lines (1-3)', 'error');
        return;
    }

    if (isNaN(betAmount) || betAmount <= 0) {
        showMessage('Invalid bet amount', 'error');
        return;
    }

    const totalBet = betAmount * linesCount;

    if (totalBet > balance) {
        showMessage(`Insufficient balance. Need $${totalBet}`, 'error');
        return;
    }

    // Deduct balance
    balance -= totalBet;
    updateBalanceDisplay();
    winningsDisplay.textContent = '$0';

    // Generate result
    const resultCols = spin();
    // resultCols is [ [Col1Row1, Col1Row2, Col1Row3], [Col2Row1...], ... ]

    // Animate
    await animateReels(resultCols);

    // Calculate winnings
    // Transpose to rows for checking
    const rows = transpose(resultCols);
    const winnings = getWinnings(rows, betAmount, linesCount);

    balance += winnings;
    updateBalanceDisplay();

    if (winnings > 0) {
        winningsDisplay.textContent = `$${winnings}`;
        showMessage(`YOU WON $${winnings}!`, 'success');
    } else {
        showMessage('No luck this time.', 'info');
    }

    if (balance <= 0) {
        showMessage('Game Over! Deposit to play again.', 'error');
        bettingSection.classList.add('hidden');
        depositSection.classList.remove('hidden');
    }
};

// Event Listeners
depositBtn.addEventListener('click', handleDeposit);

spinBtn.addEventListener('click', handleSpin);

// Initial Message
showMessage('Welcome! Deposit to start.');
