var fps = 30;
var mainCanvas, mainContext, mainCanvasWidth, mainCanvasHeight;
var mazeWidth = 660, mazeHeight = 390;
var gridCols = 16, gridRows = 9;
var bgImage, bgPattern, bgTileWidth = 100, bgTileHeight = 100;
var treeSprites = [], treeWidth = 20, treeHeight = 20;
var playerSprite, playerPosition, movePlayer = 0;
var goalSprite;
var arrowUpSprite, arrowDownSprite, arrowLeftSprite, arrowRightSprite;
var maze;
var gameWon = false;
var settingUpGame = false;

$(document).ready(init);

function init() {
	mainCanvas = document.getElementById('mazeGame');
	mainContext = mainCanvas.getContext('2d');
	mainCanvasWidth = mainCanvas.width;
	mainCanvasHeight = mainCanvas.height;
	
	settingUpGame = true;
	mainCanvas.addEventListener('mousedown', processMouseInput, false);
	setInterval(gameLoop, 1000/fps);
	
	var bgImage = new Image();
	bgImage.src = 'img/grass.png';
	bgImage.loaded = false;
	bgImage.onload = function() {
		bgPattern = mainContext.createPattern(bgImage, 'repeat');
		bgImage.loaded = true;
	}
	
	playerSprite = new Sprite(mainContext, 'img/player.png');
	playerSprite.location.x = treeWidth;
	playerSprite.location.y = treeWidth;
	playerSprite.visible = false;
	
	goalSprite = new Sprite(mainContext, 'img/goal.png');
	goalSprite.location.x = (2 * gridCols - 1) * treeWidth;
	goalSprite.location.y = (2 * gridRows - 1) * treeHeight;
	goalSprite.visible = false;
	
	arrowUpSprite = new Sprite(mainContext, 'img/arrowUp.png');
	arrowUpSprite.location.x = 50;
	arrowUpSprite.location.y = mazeHeight;
	
	arrowDownSprite = new Sprite(mainContext, 'img/arrowDown.png');
	arrowDownSprite.location.x = 50;
	arrowDownSprite.location.y = mazeHeight + 50;
	
	arrowLeftSprite = new Sprite(mainContext, 'img/arrowLeft.png');
	arrowLeftSprite.location.x = 0;
	arrowLeftSprite.location.y = mazeHeight + 25;
	
	arrowRightSprite = new Sprite(mainContext, 'img/arrowRight.png');
	arrowRightSprite.location.x = 100;
	arrowRightSprite.location.y = mazeHeight + 25;
	
	resetSprite = new Sprite(mainContext, 'img/reset.png');
	resetSprite.location.x = mainCanvasWidth - 50;
	resetSprite.location.y = mainCanvasHeight - 50;
	
	generateMaze();
}

function generateMaze()
{   
	var drawObject, i, j, mazeCol, mazeRow;
	treeSprites = [];

	// implementation of Eller's Algorithm for 2D, rectangular maze generation
	// http://www.neocomputer.org/projects/eller.html
	
	// create space for maze
	maze = [];
	// create space for current row of cells
	var row = [];
	// create space to store set id
	var sets = new Array(gridCols);
	// store next available id number for set id's
	var nextSetID = 1;
	// loop control variable
	var mazeFinished = false;
	// other variables that will be used
	var wallsCreated, currentSet, allowWallCreation, neighborSet;

	// 1. create first row of cells
	for (i = 0; i < gridCols; i ++ ) {
		// first cell has a west wall
		// last cell has an east wall
		// all cells have a north wall and no south wall
		row.push([true, i == gridCols - 1, false, i == 0]);
	}

	while ( !mazeFinished ) {
		// 2. join any cell not members of a set to a unique set
		for (i = 0; i < gridCols; i ++ ) {
			if ( typeof sets[i] === "undefined" ) {
				sets[i] = nextSetID;
				nextSetID = nextSetID + 1;
			}
		}
				
		// 3. create east walls
		for (i = 0; i < gridCols; i ++ ) {
			// if not the last cell, decide whether or not to create a wall on the east;
			// if the cell to the east belongs to the same set, then force it; otherwise, use a 50% chance
			if ( i < gridCols - 1 ) {
				if ( sets[i] === sets[i + 1] || Math.random() >= 0.5 ) {
					row[i][1] = true;
					// set west wall of cell neighboring to the east
					row[i + 1][3] = true;
				}
				// if not creating wall, cell east of current cell needs to join current cell's set
				else {
					sets[i + 1] = sets[i];
				}
			}
		}
		
		// 4. create south walls
		wallsCreated = {};
		for ( i = 0; i < gridCols; i ++ ) {
			currentSet = sets[i];
			// find out if the cell is not the only one in its set or
			// if it is the only member of its set without a bottom wall;
			// in either case, the south wall cannot be built
			allowWallCreation = true;
			if ( sets.filter( function(element) { return element === currentSet } ).length === 1 ) {
				allowWallCreation = false;
			}
			else {
				// see if this is the last cell of this set
				if ( sets.slice(i + 1).filter( function(element) { return element === currentSet } ).length === 0 ) {
					// check to make sure at least one cell in this set has an open wall;
					// if not, disallow creation of the wall
					if ( sets.slice(0, i).filter( function(element) { return element === currentSet } ).length === wallsCreated[currentSet] ) {
						allowWallCreation = false;
					}
				}
			}

			// check to see if wallsCreated dictionary needs a new entry
			if ( typeof wallsCreated[sets[i]] === "undefined" ) {
				wallsCreated[currentSet] = 0;
			}
			// now attempt to create south wall (if allowed, it's a 50% chance)
			if ( allowWallCreation && Math.random() >= 0.5 ) {
				row[i][2] = true;
				// log that a wall has been created for this set
				if ( typeof wallsCreated[sets[i]] === "number" ) {
					wallsCreated[currentSet] = wallsCreated[currentSet] + 1;
				}
			}
		}
			
		// 5. decide to add rows or complete the maze   
		if ( maze.length < gridRows - 1 ) {
			// maze not finished, continue on
			maze.push(JSON.parse(JSON.stringify(row)));
			for (i = 0; i < gridCols; i ++ ) {
				// remove east wall (if not last cell in row)
				if ( i < gridCols - 1 ) {
					row[i][1] = false;
					// remove the east neighbor's west wall
					row[i + 1][3] = false;
				}
				// if south wall exists, remove cell from current set and remove south wall
				if ( row[i][2] === true ) {
					delete sets[i]; // IS THIS CORRECT?
					row[i][2] = false;
					// since south wall exists, north wall of this new cell exists too
					row[i][0] = true;
				}
				// if south wall doesn't exist, make sure that this new cell below previous cell
				// has no north wall
				else {
					row[i][0] = false;
				}
			}
			// move back to step 2 (beginning of while loop)
		}
		else {
			for (i = 0; i < gridCols; i ++ ) {
				// add south wall
				row[i][2] = true;
				// if there is a neighbor to the east and it is part of a different set
				if ( i < gridCols - 1 ) {
					currentSet = sets[i];
					neighborSet = sets[i + 1]
					if ( currentSet != neighborSet ) {
						// remove current cell's east wall
						row[i][1] = false;
						// remove neighbor cell's west wall
						row[i + 1][3] = false;
						// make every cell part of the neighbor's set part of the current cell's set
						for (j = 0; j < gridCols; j ++ ) {
							if ( sets[j] == neighborSet ) {
								sets[j] = currentSet;
							}
						}
					}
				}
			}
			maze.push(JSON.parse(JSON.stringify(row)));
			mazeFinished = true;
		}
	}
	// return the maze lists transposed to use the more familiar [col][row] indexing
	// using clever snippet explained here: http://stackoverflow.com/a/17428705/4747275
	maze = maze[0].map(function(col, i) { 
		return maze.map(function(row) { 
			return row[i];
		})
	});

	for ( i = 0; i < 2 * gridCols + 1; i ++ ) {
		for ( j = 0; j < 2 * gridRows + 1; j ++ ) {
			drawObject = false;
			if ( i === 0 || j === 0 || i === 2 * gridCols || j === 2 * gridRows ) {
				drawObject = true;
			}
			else if ( i % 2 === 0 && j % 2 === 0 ) {
				drawObject = true;
			}
			else if ( !(i % 2 === 1 && j % 2 === 1) ) {
				if ( i % 2 === 0 ) {
					mazeCol = (i - 2) / 2;
					mazeRow = (j - 1) / 2;
					if ( maze[mazeCol][mazeRow][1] === true ) {
						drawObject = true;
					}
				}
				else if ( i % 2 === 1 ) {
					mazeCol = (i - 1) / 2;
					mazeRow = (j - 2) / 2;
					if ( maze[mazeCol][mazeRow][2] === true ) {
						drawObject = true;
					}
				}
			}
			
			if ( drawObject === true ) {
				var newSprite = new Sprite(mainContext, 'img/tree.png');
				newSprite.location.x = i * treeWidth;
				newSprite.location.y = j * treeHeight;
				treeSprites.push(newSprite);
			}
		}
	}
	
	playerSprite.visible = goalSprite.visible = true;
	playerPosition = new Point(0, 0);
	
	settingUpGame = false;
}

// ----------------------------------------------------

function gameLoop() {
	if ( settingUpGame ) {
		return;
	}
	
	update();
	draw();
}

function update() {
	if ( movePlayer > 0 ) {
		switch ( movePlayer ) {
			case 1:
				if ( maze[playerPosition.x][playerPosition.y][0] === false ) {
					playerPosition.y -= 1;
				}
				break;
			case 2:
				if ( maze[playerPosition.x][playerPosition.y][1] === false ) {
					playerPosition.x += 1;
				}
				break;
			case 3:
				if ( maze[playerPosition.x][playerPosition.y][2] === false ) {
					playerPosition.y += 1;
				}
				break;
			case 4:
				if ( maze[playerPosition.x][playerPosition.y][3] === false ) {
					playerPosition.x -= 1;
				}
				break;
		}
		playerSprite.moveTo((2 * playerPosition.x + 1) * treeWidth, (2 * playerPosition.y + 1) * treeHeight);
		movePlayer = 0;
		if ( playerPosition.x === gridCols - 1 && playerPosition.y === gridRows - 1 ) {
			gameWon = true;
		}
	}
}

function draw() {
	mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
	
	mainContext.fillStyle = bgPattern;
	mainContext.fillRect(0, 0, mainCanvasWidth, mainCanvasHeight);
	
	for ( var i = 0; i < treeSprites.length; i ++ ) {
		treeSprites[i].draw();
	}
	
	goalSprite.draw();
	playerSprite.draw();
	
	mainContext.fillStyle = "#009900";
	mainContext.fillRect(0, mazeHeight, mazeWidth, mainCanvasHeight - mazeHeight);
	
	arrowUpSprite.draw();
	arrowDownSprite.draw();
	arrowRightSprite.draw();
	arrowLeftSprite.draw();
	
	resetSprite.draw();
	
	mainContext.font = "20px serif";
	mainContext.fillStyle = "#ffffff";
}

function restartGame() {
	gameWon = false;
	settingUpGame = true;
	mainContext.font = "32px serif";
	mainContext.fillText('Generating New Maze...', 180, 200);
	setTimeout(triggerMazeRegen, 100);
}
	
function triggerMazeRegen() {
	playerSprite.visible = goalSprite.visible = false;
	playerSprite.moveTo(treeWidth, treeHeight);
	generateMaze();
}

// ----------------------------------------------------

function processMouseInput(event)
{   
	event.preventDefault();
	
	if ( settingUpGame ) {
		return;
	}
	
	var boundingRectangle = mainCanvas.getBoundingClientRect();
	var mouseX = event.clientX - boundingRectangle.left;
	var mouseY = event.clientY - boundingRectangle.top;
	
	if ( mouseX > mainCanvasWidth - 50 && mouseX < mainCanvasWidth && mazeHeight + 50 && mouseY < mazeHeight + 100 ) {
		restartGame();
	}
	else if ( gameWon ) {
		return;
	}
	if ( mouseX > 0 && mouseX < 50 && mouseY > mazeHeight + 25 && mouseY < mazeHeight + 75 ) {
		movePlayer = 4;
	}
	else if ( mouseX > 50 && mouseX < 100 && mouseY > mazeHeight && mouseY < mazeHeight + 50 ) {
		movePlayer = 1;
	}
	else if (  mouseX > 50 && mouseX < 100 && mouseY > mazeHeight + 50 && mouseY < mazeHeight + 100 ) {
		movePlayer = 3;
	}
	else if ( mouseX > 100 && mouseX < 150 && mouseY > mazeHeight + 25 && mouseY < mazeHeight + 75 ) {
		movePlayer = 2;
	}
}

// ----------------------------------------------------

function Point(x, y)
{
	this.x = x;
	this.y = y;
}

// ----------------------------------------------------

function Sprite(context, spriteSource) {
	this.context = context;
	this.visible = true;
	this.location = new Point(0, 0);
	
	this.imageObject = new Image();
	this.imageObject.loaded = false;
	this.imageObject.onload = function() {
		this.loaded = true;
	}
	this.imageObject.src = spriteSource;
}

Sprite.prototype.moveTo = function(x, y) {
	this.location.x = x;
	this.location.y = y;
}

Sprite.prototype.draw = function() {
	if ( this.imageObject.loaded === true && this.visible === true ) {
		this.context.drawImage(this.imageObject, this.location.x, this.location.y);
	}
}














