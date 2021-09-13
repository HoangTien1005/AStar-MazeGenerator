let windowSize =
  window.innerWidth < window.innerHeight
    ? window.innerWidth
    : window.innerHeight;
windowSize -= windowSize % 100;
const WIDTH = windowSize > 650 ? (windowSize - 200) : windowSize - 50;
const HEIGHT = windowSize > 650 ? (windowSize - 200) : windowSize - 50;
const COLS = 50;
const ROWS = 50;

function heuristic(a, b) {
  const d = dist(a.i, a.j, b.i, b.j);
  //const d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

const w = WIDTH / COLS; // width of the rectangle
const h = HEIGHT / ROWS; // height of the rectangle

let path = [];
let finish;
const grid = new Array(COLS);

const openSet = [];
const closedSet = [];
let start;
let end;
let noSolution = false;

function Spot(i, j) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.previous = undefined;
  this.wall = Math.random(1) < 0.3 ? true : false;

  this.show = function (color) {
    fill(color);
    if (this.wall) fill(30);
    if (this == start || this == end) fill(204, 0, 255);

    noStroke();
    rect(this.i * w, this.j * h, h);
  };

  this.addNeighbors = function (grid) {
    const i = this.i;
    const j = this.j;

    const pos = [-1, 0, 1];
    for (let a of pos) {
      for (let b of pos) {
        let tempI = i + a;
        let tempJ = j + b;
        if (tempI > -1 && tempJ > -1 && tempI < COLS && tempJ < ROWS) {
          if (a != 0 || b != 0) {
            if (a != 0 && b != 0) {
              if (
                !grid[tempI - a][tempJ].wall ||
                !grid[tempI][tempJ - b].wall
              ) {
                this.neighbors.push(grid[tempI][tempJ]);
              }
            } else this.neighbors.push(grid[tempI][tempJ]);
          }
        }
      }
    }
  };
}

let replayBtn;
let replayBtnX = window.innerWidth / 2;
let replayBtnY = window.innerHeight / 2 + HEIGHT / 2;
replayBtnY += window.innerWidth > 738 ? 44 : 30;

let returnBtn;
let returnBtnX = window.innerWidth / 2;
let returnBtnY = window.innerHeight / 2 + HEIGHT / 2 - 16;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(40);

  returnBtn=createButton('Return');
  returnBtn.position(returnBtnX, returnBtnY);

  returnBtn.mousePressed(function(){
    window.location = '../';
    return false;
  });
}

// Making a 2D array
for (let i = 0; i < COLS; i++) {
  grid[i] = new Array(ROWS);
}

for (let i = 0; i < COLS; i++) {
  for (let j = 0; j < ROWS; j++) {
    grid[i][j] = new Spot(i, j);
  }
}

for (let i = 0; i < COLS; i++) {
  for (let j = 0; j < ROWS; j++) {
    grid[i][j].addNeighbors(grid);
  }
}

start = grid[0][0];
end = grid[COLS - 1][ROWS - 1];
start.wall = false;
end.wall = false;

openSet.push(start);

function draw() {
  if (openSet.length > 0) {
    let winner = 0;
    for (let i in openSet) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    var current = openSet[winner];

    if (current === end) {
      finish = true;
      noLoop();
      replayBtn=createButton('Done! Play again');
      replayBtn.position(replayBtnX, replayBtnY);

      replayBtn.mousePressed(function(){
        window.location.reload();
      });
      
      
    }

    openSet.splice(winner, 1);
    closedSet.push(current);

    let neighbors = current.neighbors;

    for (let neighbor of neighbors) {
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        const tempG = current.g + 1;
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
          neighbor.previous = current;
        }
      }
    }
    // we can keep going
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

  background(255);

  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      grid[i][j].show(color(255));
    }
  }

  for (let i in closedSet) {
    closedSet[i].show(color(255, 102, 102));
  }

  for (let i in openSet) {
    openSet[i].show(color(152, 255, 152));
  }

  path = [];
  let temp = current;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }

  noFill();
  stroke(51, 102, 255);
  strokeWeight(w / 2.2);
  beginShape();
  for (let i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}

function mousePressed() {
  noLoop();
}

function mouseReleased() {
    if(!finish && !noSolution) loop();
}

function keyPressed() {
    if(keyCode === 32) {
      window.location.reload();
    }
    return false;
}

