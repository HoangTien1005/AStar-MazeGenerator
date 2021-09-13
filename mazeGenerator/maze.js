let windowSize =
  window.innerWidth < window.innerHeight
    ? window.innerWidth
    : window.innerHeight;
windowSize -= windowSize % 100;
const WIDTH = windowSize > 650 ? windowSize - 200 : windowSize - 40;
const HEIGHT = windowSize > 650 ? windowSize - 200 : windowSize - 40;
const COLS = 20;
const ROWS = 20;

const weight = windowSize <= 700 ? 1 : 4;

const w = WIDTH / COLS;
const h = HEIGHT / ROWS;

const stack = [];

const grid = new Array(COLS);

const finish = false;

let current;
let end;

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.walls = [true, true, true, true]; // top, right, bottom. left
  this.visited = false;

  this.show = function () {
    const x = this.i * w;
    const y = this.j * h;

    stroke(0);
    strokeWeight(weight);
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
      fill(255);
      rect(x, y, w, h);
    }
  };

  this.checkNeighbors = function () {
    let neighbors = [];
    let pos = []; // top, right, bottom, left position

    if (j - 1 > -1) {
      pos.push(grid[i][j - 1]); // top
    }

    if (i + 1 < COLS) {
      pos.push(grid[i + 1][j]); // right
    }

    if (j + 1 < ROWS) {
      pos.push(grid[i][j + 1]); // bottom
    }

    if (i - 1 > -1) {
      pos.push(grid[i - 1][j]); // left
    }

    for (let neighbor of pos) {
      // if not visited then push to neighbors
      if (!neighbor.visited) {
        neighbors.push(neighbor);
      }
    }

    if (neighbors.length > 0) {
      const r = floor(random(0, neighbors.length));
      return neighbors[r];
    } else {
      return undefined;
    }
  };

  this.highlight = function (color) {
    const x = this.i * w;
    const y = this.j * w;
    noStroke();
    fill(color);
    rect(x, y, w, w);
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
  for (let i = 0; i < COLS; i++) {
    grid[i] = new Array(ROWS);
  }

  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }
  background(0);
  current = grid[0][0];
  end = grid[ROWS - 1][COLS - 1];

  returnBtn = createButton("Return");
  returnBtn.position(returnBtnX, returnBtnY);

  returnBtn.mousePressed(function () {
    window.location = "../";
    return false;
  });
}

function draw() {
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      grid[i][j].show();
      end.highlight(color(255, 204, 0));
    }
  }

  current.visited = true;
  current.highlight(color(255, 204, 0));
  const next = current.checkNeighbors();
  if (next) {
    next.visited = true;
    stack.push(current);
    removeWalls(current, next);
    current = next;
  } else if (stack.length > 0) {
    current = stack.pop();
  }

  if (stack.length == 0) {
    replayBtn = createButton("Done! Play again");
    replayBtn.position(replayBtnX, replayBtnY);
    
    noLoop();

    replayBtn.mousePressed(function () {
      window.location.reload();
    });

    
  }

  stroke(0);
  strokeWeight(weight + 1);
  line(0, 0, WIDTH, 0);
  line(0, 0, 0, HEIGHT);
  line(WIDTH, 0, WIDTH, HEIGHT);
  line(0, HEIGHT, WIDTH, HEIGHT);
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

function mousePressed() {
  noLoop();
}

function mouseReleased() {
  loop();
}

function keyPressed() {
  if (keyCode === 32) {
    window.location.reload();
  }
  return false;
}
