const rows = 40;
const columns = 40;

// Initialize the rows for the current and next generation
let currentGen = new Array(rows);
let nextGen = new Array(rows);
let savedState = new Array(rows);

function createWorld() {
    let world = document.querySelector('#world');
    let grid = document.createElement('table');
    grid.setAttribute('id','worldgrid');
    for (let row = 0; row < rows; row++) {
        let gridRow = document.createElement('tr');
        for (let column = 0; column < columns; column++) {
            let cell = document.createElement('td');
            cell.setAttribute('id', row + '_' + column);
            cell.setAttribute('class', 'dead');
            cell.addEventListener('click', cellClick);
            gridRow.appendChild(cell);
        }
        grid.appendChild(gridRow);
    }
    world.appendChild(grid);
}

// This creates the inner array of columns for each row
function createGenArrays() {
    for (let row = 0; row < currentGen.length; row++) {
        currentGen[row] = new Array(columns);
        nextGen[row] = new Array(columns);
        savedState[row] = new Array(columns);
    }
}

function initGenerationArrays(fromSavedConfig) {
    for (let rowIndex = 0; rowIndex < currentGen.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < currentGen[rowIndex].length; columnIndex++) {
            currentGen[rowIndex][columnIndex] = (fromSavedConfig) ? savedState[rowIndex][columnIndex] : 0;
            nextGen[rowIndex][columnIndex] = 0;
        }
    }
}

function copyState(sourceState, destState) {
    for (let rowIndex = 0; rowIndex < sourceState.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < sourceState[rowIndex].length; columnIndex++) {
            destState[rowIndex][columnIndex] = sourceState[rowIndex][columnIndex];
        }
    }
}

function clearState(stateArray) {
    for (let rowIndex = 0; rowIndex < stateArray.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < stateArray[rowIndex].length; columnIndex++) {
            stateArray[rowIndex][columnIndex] = 0;
        }
    }
}

function getNeighborCount(rowIndex, columnIndex) {
    let neighborCount = 0;

    // Check top left
    if (rowIndex > 0 && columnIndex > 0) {
        if (currentGen[rowIndex - 1][columnIndex - 1]) {
            neighborCount++;
        }
    }

    // Check top center
    if (rowIndex > 0) {
        if (currentGen[rowIndex - 1][columnIndex]) {
            neighborCount++;
        }
    }

    // Check top right
    if (rowIndex > 0 && columnIndex < columns - 1) {
        if (currentGen[rowIndex - 1][columnIndex + 1]) {
            neighborCount++;
        }
    }

    // Check right
    if (columnIndex < columns - 1) {
        if (currentGen[rowIndex][columnIndex + 1]) {
            neighborCount++;
        }
    }

    // check lower right
    if (rowIndex < rows - 1 && columnIndex < columns - 1) {
        if (currentGen[rowIndex + 1][columnIndex + 1]) {
            neighborCount++;
        }
    }

    // Check lower
    if (rowIndex < rows - 1) {
        if (currentGen[rowIndex + 1][columnIndex]) {
            neighborCount++;
        }
    }

    // Check lower left
    if (rowIndex < rows - 1 && columnIndex > 0) {
        if (currentGen[rowIndex + 1][columnIndex - 1]) {
            neighborCount++;
        }
    }

    // Check left
    if (columnIndex > 0) {
        if (currentGen[rowIndex][columnIndex - 1]) {
            neighborCount++;
        }
    }
    return neighborCount;
}

function createNextGen() {
    for (let rowIndex = 0; rowIndex < currentGen.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < currentGen[rowIndex].length; columnIndex++) {
            let neighbors = getNeighborCount(rowIndex, columnIndex);

            // Check the rules
            // If Alive
            if (currentGen[rowIndex][columnIndex] === 1) {
                if (neighbors < 2) {
                    nextGen[rowIndex][columnIndex] = 0;
                }
                else if (neighbors === 2 || neighbors === 3) {
                    nextGen[rowIndex][columnIndex] = 1;
                }
                else if (neighbors > 3) {
                    nextGen[rowIndex][columnIndex] = 0;
                }
            }
            else if (currentGen[rowIndex][columnIndex] === 0) {

                // If Dead or Empty and 3 neighbors birth
                if (neighbors === 3) {
                    nextGen[rowIndex][columnIndex] = 1;//Birth?
                }
            }
        }
    }
}

function updateCurrentGen() {
    copyState(nextGen, currentGen);
    clearState(nextGen);
}

function updateWorld() {
    for (let rowIndex = 0; rowIndex < currentGen.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < currentGen[rowIndex].length; columnIndex++) {
            let cell = document.getElementById(rowIndex + '_' + columnIndex);
            if (currentGen[rowIndex][columnIndex] === 0) {
                cell.setAttribute('class', 'dead');
            }
            else {
                cell.setAttribute('class', 'alive');
            }
        }
    }
}

function cellClick() {
    let location = this.id.split("_");
    let row = Number(location[0]);
    let column = Number(location[1]);

    // Toggle cell alive or dead
    if (this.className === 'alive') {
        this.setAttribute('class', 'dead');
        currentGen[row][column] = 0;
    }
    else {
        this.setAttribute('class', 'alive');
        currentGen[row][column] = 1;
    }
}

function evolve(){
    if (!hasEvolved) {
        hasEvolved = true;
        copyState(currentGen, savedState);
        let resetButton = document.getElementById('resetState');
        resetButton.setAttribute('value', 'Reset');
    }
    createNextGen();    //Apply the rules
    updateCurrentGen();    //Set Current values from new generation
    updateWorld();  //Update the world view
}

let evolving = false;
let backgroundTimer = null;
let hasEvolved = false;
let timerDelay = 1000;

function resetState() {
    if (evolving) {
        restoreInitial();
    }
    else if (hasEvolved) {
        restoreInitial();
        let resetButton = document.getElementById('resetState');
        resetButton.setAttribute('value', 'Clear');
        hasEvolved = false;
    }
    else {
        clearState(savedState);
        clearState(currentGen);
        clearState(nextGen);
    }
    updateWorld();
}

function restoreInitial() {
    copyState(savedState, currentGen);
    clearState(nextGen);
}

function startStop() {
    let startStopButton = document.getElementById('startStop');
    let resetButton = document.getElementById('resetState');
    evolving = !evolving;
    if (evolving) {
        backgroundTimer = window.setInterval(evolve, timerDelay);
        startStopButton.setAttribute('value', 'Stop');
        resetButton.setAttribute('value', 'Reset');
        copyState(currentGen, savedState);
    }
    else {
        if (backgroundTimer)
            window.clearInterval(backgroundTimer);
        startStopButton.setAttribute('value', 'Start');
    }
}

function changeTimer(value) {
    timerDelay = value;
    if (backgroundTimer) {
        window.clearInterval(backgroundTimer);
        backgroundTimer = window.setInterval(evolve, timerDelay);
    }
}

window.onload = () => {
    createWorld();
    createGenArrays();
    initGenerationArrays();
}