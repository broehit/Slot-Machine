// 1. Deposit Money
// 2. Determine number of lines to bet
// 3. Collect the bet amount
// 4. Spin the Slot machine
// 5. check if user won
// 6. give the user their winnings
// 7. Play again


const prompt = require("prompt-sync")({ sigint: true });

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

const deposit = () => {
    while (true) {
        const depositAmount = prompt("Enter the amount you want to deposit: ");
        const numberDepositAmount = parseFloat(depositAmount);

        if (isNaN(numberDepositAmount) || numberDepositAmount <= 0) {
            console.log("Please enter a valid deposit amount.");
        } else {
            return numberDepositAmount;
        }
    }
};


const getNumberofLines= () => {
    while (true) {
        const lines = prompt("Enter the number of lines to bet on (1-3): ");
        const numberOfLines = parseInt(lines);

        if (isNaN(numberOfLines) || numberOfLines < 1 || numberOfLines > 3) {
            console.log("Please enter a valid number of lines (1-3).");
        } else {
            return numberOfLines;
        }
    }

}
const getBet = (balance, lines) => {
    while (true) {
        const bet = prompt("Enter the bet per line: ");
        const numberBet = parseFloat(bet);

        if (isNaN(numberBet) || numberBet <= 0 || numberBet * lines > balance) {
            console.log("Invalid bet amount. Please enter a valid amount that does not exceed your balance.");
        } else {
            return numberBet;
        }
    }
};

const spin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)){
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }
    const reels = [];
    for (let i = 0; i < COLS; i++) {
        reels.push([]);
        const reelSymbols = [...symbols];
        for (let j = 0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            reels[i].push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
    }
    return reels;
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
}

const printRows = (rows) => {
    for (const row of rows) {
        let rowString = " ";
        for (const [i, symbol] of row.entries()) {
            rowString += symbol
            if (i !== row.length - 1) {
                rowString += " | ";
            }
        }
        console.log(rowString);
    }
};

const getWinnings = (rows, bet, lines) => {
    let winnings = 0;
    for (let row= 0; row < rows.length; row++) {
        const symbols = rows[row];
        let allSame = true;

        for (const symbol of symbols){
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

const game= () => {
    let balance = deposit();

    while (true) {
        console.log("You have a balance of $" + balance);
        
    const numberOfLines= getNumberofLines();
    const bet= getBet(balance, numberOfLines);
    balance -= bet * numberOfLines;
    const reels = spin();
    const rows = transpose(reels);
    printRows(rows);

    const winnings = getWinnings(rows, bet, numberOfLines);
    balance += winnings;
        console.log("You won, $" + winnings.toString());
        if (balance <= 0) {
            console.log("You ran out of money!");
            break;
        }
        const playAgain = prompt("Do you want to play again? (y/n): ");
        if (playAgain.toLowerCase() !== 'y') break;

    }
};

game();