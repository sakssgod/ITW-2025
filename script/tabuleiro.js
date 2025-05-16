function Difficulty(rows, columns, number_mines, time_limit) {
    this.rows = rows;
    this.columns = columns;
    this.number_mines = number_mines;
    this.time_limit = time_limit;
}

let DIFFICULTY = [
    new Difficulty(15, 15, 30, 300)
];





window.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("gameBoard");
    const currentDifficulty = DIFFICULTY[0];
    const rows = currentDifficulty.rows;
    const cols = currentDifficulty.columns;

    for (let i = 0; i < rows * cols; i++) {
        const div = document.createElement("div");
        div.classList.add("cell");
        gameBoard.appendChild(div);
    }
});
