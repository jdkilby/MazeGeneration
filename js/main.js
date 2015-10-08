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
	$.get('../scripts/getMaze.php', { width: gridCols, height: gridRows }, processMaze);
}

function processMaze(data)
{
	// parse string data
	data = data.substring(2, data.length - 2);
	data = data.split(/\]\],\[\[/);
	for ( var i = 0; i < data.length; i ++ ) {
		data[i] = data[i].split('\],\[');
		for ( var j = 0; j < data[i].length; j ++ ) {
			data[i][j] = data[i][j].split(',');
			for ( var k = 0; k < data[i][j].length; k ++ ) {
				data[i][j][k] = (data[i][j][k] === "true") || (data[i][j][k] === "[true") || (data[i][j][k] === "true]");
			}
		}
	}
	
	maze = data;
	
	treeSprites = [];
	
	var drawObject, i, j, mazeCol, mazeRow;
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














