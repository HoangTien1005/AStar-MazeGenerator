let windowSize = window.innerWidth <  window.innerHeight ?  window.innerWidth :  window.innerHeight;
windowSize -= windowSize % 100;
const WIDTH = windowSize > 650 ? (windowSize - 200) : windowSize - 50;
const HEIGHT = windowSize > 650 ? (windowSize - 200) : windowSize - 50;
const COLS = 25;
const ROWS = 25;
const w = WIDTH / COLS;
const h = HEIGHT / ROWS;


const stack = [] // stack is used for executing the maze algorithm

let current; 


let path = [];      

const openSet = [];
const closedSet = [];

let start;                  // the first (top left) cell
let end;                    // the last (bottom right) cell

let noSolution = false;     // case: no solution
let finish = false;         // case: finish

const grid = new Array(COLS);     

function Cell(i, j) {

    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];  // walls around the Cell (top, right, bottom, left)
    this.visited = false;                   // check if the maze algorithm have visited this

    // f, g, h is used for the calculation of the A-star algorithm
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.previous = undefined;                  // use for showing the path

    this.neighbors = [];                        // which cells it can move to


    // function to draw the Cell
    this.show = function (color) { 
        const x = this.i * w;
        const y = this.j * h;

        stroke(0);
        strokeWeight(2);
        if (this.walls[0]) {
            line(x, y, x + w, y); // draw a line on the top
        }
        if (this.walls[1]) {
            line(x + w, y, x + w, y + h); // draw a line on the right
        }
        if (this.walls[2]) {
            line(x, y + h, x + w, y + h); // draw a line on the bottom
        }
        if (this.walls[3]) {
            line(x, y, x, y + h); // draw a line on the left
        }

        if (this.visited) {
            noStroke();
            fill(color);
            if (this == start || this == end) fill(255, 255, 0);
            rect(x, y, w, h);
        }

    }


    this.checkNeighborsWall = function () {
        const neighbors = [];
        const pos = [];                       // top, right, bottom, left position 

        if (j - 1 > -1) {
            pos.push(grid[i][j - 1]);       // top
        }

        if (i + 1 < COLS) {
            pos.push(grid[i + 1][j]);       // right
        }

        if (j + 1 < ROWS) {
            pos.push(grid[i][j + 1]);       // bottom
        }

        if (i - 1 > -1) {
            pos.push(grid[i - 1][j]);       // left
        }

        for (var neighbor of pos) {         // if not visited then push to neighbors
            if (!neighbor.visited) {
                neighbors.push(neighbor);
            }
        }

        if (neighbors.length > 0) {
            const r = floor(random(0, neighbors.length));
            return neighbors[r];       // return a random neighbor   
        } else {
            return undefined;
        }

    }


    this.addNeighbors = function () {
        if (!this.walls[0] && (j - 1 > -1)) { // if there is no wall on the top
            this.neighbors.push(grid[i][j - 1]); // then push the top cell to the neighbors
        }

        if (!this.walls[1] && (i + 1 < COLS)) { // if there is no wall on the right
            this.neighbors.push(grid[i + 1][j]); // then push the right cell to the neighbors
        }

        if (!this.walls[2] && (j + 1 < ROWS)) { // if there is no wall on the bottom
            this.neighbors.push(grid[i][j + 1]); // then push the bottom cell to the neighbors
        }

        if (!this.walls[3] && (i - 1 > -1)) { // if there is no wall on the left
            this.neighbors.push(grid[i - 1][j]); // then push the left cell to the neighbors
        }
    }
}

// create a 2D array
for (let i = 0; i < COLS; i++) {
    grid[i] = new Array(ROWS);
}

// initialize all the cells
for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
        grid[i][j] = new Cell(i, j);
    }
}

current = grid[0][0];
start = grid[0][0];
end = grid[COLS - 1][ROWS - 1];

let replayBtn;
let replayBtnX = window.innerWidth / 2;
let replayBtnY = window.innerHeight / 2 + HEIGHT / 2;
replayBtnY += window.innerWidth > 738 ? 44 : 30;

let returnBtn;
let returnBtnX = window.innerWidth / 2;
let returnBtnY = window.innerHeight / 2 + HEIGHT / 2 - 16;

function setup() {
    createCanvas(WIDTH, HEIGHT);        // draw the canvas 
    createMaze();                       // create the maze
    background(255);

    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            grid[i][j].addNeighbors();      // add neighbors to all the cells
        }
    }

    returnBtn=createButton('Return');
    returnBtn.position(returnBtnX, returnBtnY);

    returnBtn.mousePressed(function(){
        window.location = '../';
        return false;
    });
}


openSet.push(start);

// the main loop of the program
function draw() {
    if (openSet.length > 0) {
        let winner = 0;
        for (let i in openSet) {
            if (openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }
        var cur = openSet[winner];

        // if found the bottom right cell, stop
        if (cur === end) {
            noLoop();
            finish = true;
            replayBtn=createButton('Done! Play again');
            replayBtn.position(replayBtnX, replayBtnY);
            

            replayBtn.mousePressed(function(){
                window.location.reload();
            });

           
        }

        openSet.splice(winner, 1);
        closedSet.push(cur);

        let neighbors = cur.neighbors;

        for (let neighbor of neighbors) {

            if (!closedSet.includes(neighbor) && !neighbor.wall) {
                let tempG = cur.g + 1;
                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }
                if (newPath) {
                    neighbor.h = heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = cur;
                }
            }
        }
        
    } else {      
        replayBtn=createButton('No solution! Play again');
        replayBtn.position(replayBtnX, replayBtnY);

        replayBtn.mousePressed(function(){
            window.location.reload();
        });


        noSolution = true;
        noLoop();
        return;
    }

   

    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            grid[i][j].show(color(255));
        }
    }

    for (let i in closedSet) {
        closedSet[i].show(color(255, 102, 102, 200));
    }
    
    for (let i in openSet) {
        openSet[i].show(color(152, 255, 152));
    }

    path = [];
    let temp = cur;
    path.push(temp);
    while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
    }

    // draw the path
    noFill();
    stroke(51, 102, 255, 200);
    strokeWeight(w / 3);
    beginShape();
    for (let i = 0; i < path.length; i++) {
        vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();
}



// create the maze using Randomize-DFS algorithm
function createMaze() {
    while (1) {
        current.visited = true;
        let next = current.checkNeighborsWall();
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
}



function removeWalls(a, b) {
    const x = a.i - b.i;
    const y = a.j - b.j;
    if (x == 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x == -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }
    if (y == 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (y == -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }
}


function heuristic(a, b) {
    return dist(a.i, a.j, b.i, b.j);
}

function mousePressed() {
    noLoop();
  }

  function mouseReleased() {
      if(!finish) loop();
  }

  function keyPressed() {
    if(keyCode === 32) {
      window.location.reload();
    }
    return false;
}