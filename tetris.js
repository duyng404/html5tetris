// javascript doesn't have a sort number functions wtf
function sortNumber(a,b) {
    return a - b;
}
// helper function to shuffle elements of an array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

// tile types
const ITILE=0; const JTILE=1; const LTILE=2; const OTILE=3; const STILE=4; const TTILE=5; const ZTILE=6;
const COLOR=[0x05B7B1,0x1755D7,0xFC8E1F,0xFEF63C,0x24E767,0x9D37FA,0xFF3A3E,0xFFFFFF,0x000000];

// blueprints of all the states
const STATE = [
	// ITILE
	[
		[[0,0], [-1,0], [1,0], [2,0]],
		[[0,0], [0,-1], [0,1], [0,2]]
	],
	// JTILE
	[
		[[0,0], [-1,0], [1,0], [1,1]],
		[[0,0], [0,-1], [0,1], [-1,1]],
		[[0,0], [1,0], [-1,0], [-1,-1]],
		[[0,0], [0,1], [0,-1], [1,-1]]
	],
	// LTILE
	[
		[[0,0], [-1,0], [1,0], [-1,1]],
		[[0,0], [0,-1], [0,1], [-1,-1]],
		[[0,0], [1,0], [-1,0], [1,-1]],
		[[0,0], [0,1], [0,-1], [1,1]]
	],
	// OTILE
	[
		[[0,0], [1,0], [0,1], [1,1]]
	],
	// STILE
	[
		[[0,0], [1,0], [0,1], [-1,1]],
		[[0,0], [0,1], [-1,0], [-1,-1]]
	],
	// TTILE
	[
		[[0,0], [-1,0], [1,0], [0,1]],
		[[0,0], [0,-1], [0,1], [-1,0]],
		[[0,0], [1,0], [-1,0], [0,-1]],
		[[0,0], [0,1], [0,-1], [1,0]]
	],
	// ZTILE
	[
		[[0,0], [-1,0], [0,1], [1,1]],
		[[0,0], [0,-1], [-1,0], [-1,1]]
	]
]
var game;

// global variables
var gvar = {
    // game sizes
    gameWidth: 500,
	gameHeight: 1000,
	// spawn position
	xSpawn: 4,
	ySpawn: 1,
	// next tile position, in real pixels
	xNext: 70,
	yNext: 35,
	// board sizes
	wBoard: 10,
	hBoard: 17,
	// top left corner of board (in pixels)
	xBoard: 0,
	yBoard: 100,
	// position of HUD elements
	hudPos: {
		xNext: 20,
		yNext: 7,
		xScore: 230,
		yScore: 25,
		xLevel: 230,
		yLevel: 60,
		xHigh: 230,
		yHigh: 95,
		xPause: 75,
		yPause: 500,
		xTut: 0,
		yTut: 0,
		xTutText: 70,
		yTutText: 350,
		xTouchButton: 90,
		yTouchButton: 600,
		xGameOver: 90,
		yGameOver: 15
	},
	// tile size
	wTile: 50,
	// ready to make a new tile or not
	newTileReady: false,
	// cleaning up board or not
	cleaningUp: false,
	// accepting input or not
	acceptingInput: false,
	// difficultyTimer, changes accordingly as level increases
	diffTimer: 1500,
	// current level
	level: 1,
	// current score
	score: 0,
	// back-to-back clearing should award more points
	justScored: false,
	// is this the first tile ever?
	firstTile: true
};

// next Tile
var nTile = {
	sq: [],
	sc: [],
	type: 0,
}

// active Tile
var aTile = {
	// all the squares of the active tile
	sq: [],
	// all the squares, relative to pivot point
	sc: [],
	// position of the pivot point
	x: 0,
	y: 0,
	// type
	type: 0,
	// state, depend on what type it is
	state: 0,
	// the timer that lowers the tile down periodically
	timer: undefined
};

// ghost Tile
var gTile = {
	sq: [],
	sc: [],
	x: 0,
	y: 0
}

// current game board
var board = [ // 10x16, one extra line on top for spawning
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

// current game board, but stores sprite
var tBoard = [[],[],[],[],[],[],[],[],[],[]];

// rows that are full and marked for deletion
var del = [];

// array of prefabs texture
var texture = [];

// statistics of how many tiles have created so far
var stats = [0,0,0,0,0,0,0];

// texts and information display in the game
var hud = {};

window.onload = function(){
	// get user's window width and height
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var ratio = windowWidth / windowHeight;
	var newWidth = gvar.gameWidth;
	if (ratio > 0.5) newWidth = gvar.gameHeight * ratio;
	var difference = newWidth - gvar.gameWidth;
	gvar.gameWidth = newWidth;
	gvar.xBoard += difference / 2;
	gvar.xNext += difference / 2;
	for (var i in gvar.hudPos){
		if (i.startsWith('x'))
			gvar.hudPos[i] += difference / 2;
	}
    // creation of the game itself
	game = new Phaser.Game(gvar.gameWidth, gvar.gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
}

function preload() {
	game.load.bitmapFont('arcadefont','./arcadefont.png','./arcadefont.fnt');
	game.load.image('tutoverlay','./tutorial.png');
	// resize so it fits the screen
	game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
}

/* takes in a position on the board, draw a square and return it */
function drawASquare(x, y, color){
	// the "real" coordinate in pixels
	var rx = gvar.xBoard+(x*gvar.wTile);
	var ry = gvar.yBoard+(y*gvar.wTile);
	// make a graphic item and start to draw
	square = game.add.graphics(0,0);
	square.beginFill(color);
	square.lineStyle(0,0,0);
	square.moveTo(rx,ry);
	square.lineTo(rx+gvar.wTile-1,ry);
	square.lineTo(rx+gvar.wTile-1,ry+gvar.wTile-1);
	square.lineTo(rx,ry+gvar.wTile-1);
	square.lineTo(rx,ry);
	square.endFill();
	return square;
}

function placeASquare(x, y, type){
	// the "real" coordinate in pixels
	var rx = gvar.xBoard+(x*gvar.wTile);
	var ry = gvar.yBoard+(y*gvar.wTile);
	var a = game.add.sprite(rx,ry, texture[type]);
	return a;
	//return agame.add.sprite(rx,ry, texture[type]);
}

function updateNextTile(type){
	// get the first state of that type
	nTile.sc = STATE[type][0].slice();
	// if this is the first tile, just populate sq
	if (gvar.firstTile){
		for (var i=0; i<nTile.sc.length; i++){
			nTile.sq.push(placeASquare(0,0,type));
		}
	}
	// replace the texture with the correct one
	for (var i=0; i<nTile.sq.length; i++){
		nTile.sq[i].loadTexture(texture[type]);
		// also reposition it
		nTile.sq[i].x = gvar.xNext + nTile.sc[i][0] * gvar.wTile;
		nTile.sq[i].y = gvar.yNext + nTile.sc[i][1] * gvar.wTile;
	}
	// update the type
	nTile.type = type;
}

function makeNewTile(){
	// get the type from next tile
	aTile.type = nTile.type;
	// get the first state of that type
	aTile.sc = STATE[aTile.type][0].slice();
	// put squares on screen according to the blueprint
	for (var i=0; i<aTile.sc.length; i++){
		var newx = gvar.xSpawn + aTile.sc[i][0];
		var newy = gvar.ySpawn + aTile.sc[i][1];
		if (board[newx][newy] == 1) { gameOver(); break; }
		aTile.sq.push(placeASquare(newx, newy, aTile.type));
		aTile.sq[i].mask = hud.gameFieldMask;
	}
	// other params
	aTile.state = 0;
	aTile.x = gvar.xSpawn;
	aTile.y = gvar.ySpawn;
	// attach a timer
	aTile.timer = game.time.create(false);
	aTile.timer.loop(gvar.diffTimer,lowerTile,this);
	aTile.timer.start();
}

function transformTile(){
	for (var i=0; i<aTile.sq.length; i++){
		var newx = gvar.xBoard+gvar.wTile*(aTile.x + aTile.sc[i][0]);
		var newy = gvar.yBoard+gvar.wTile*(aTile.y + aTile.sc[i][1]);
		aTile.sq[i].x = gvar.xBoard+gvar.wTile*(aTile.x + aTile.sc[i][0]);
		aTile.sq[i].y = gvar.yBoard+gvar.wTile*(aTile.y + aTile.sc[i][1]);
	}
}

function updateGhost(){
	// if ghost doesn't exist, create it
	if (gTile.sq.length == 0){
		for (var i=0; i<aTile.sq.length; i++){
			var newx = aTile.x + aTile.sc[i][0];
			var newy = aTile.y + aTile.sc[i][1];
			gTile.sq.push(placeASquare(newx,newy,aTile.type));
			gTile.sq[i].alpha=0.2;
		}
		gTile.sc = aTile.sc.slice();
	}
	// if ghost did exist, move it back to same place as active tile
	else {
		for (var i=0; i<aTile.sq.length; i++){
			gTile.sq[i].x = aTile.sq[i].x;
			gTile.sq[i].y = aTile.sq[i].y;
		}
		gTile.sc = aTile.sc.slice();
	}
	gTile.x = aTile.x;
	gTile.y = aTile.y;
	var count=0;
	while(itsOkayToGoDown(gTile)){
		gTile.y+=1;
		count+=1;
	}
	// move the tiles
	for (let tile of gTile.sq){
		tile.y += count * gvar.wTile;
	}
}

function lowerTile(){
	gvar.acceptingInput = false;
	if (itsOkayToGoDown(aTile)){
		aTile.y += 1;
		for (let tile of aTile.sq){
			tile.y += gvar.wTile;
		}
	} else {
		commit();
	}
	gvar.acceptingInput = true;
}

function moveLeft(){
	// can we really move left?
	for (var i=0; i<aTile.sc.length; i++){
		// if it touches the left border
		if (aTile.x + aTile.sc[i][0] - 1 < 0) return;
		// if there is some tile on the left
		if (board[aTile.x + aTile.sc[i][0] - 1][aTile.y + aTile.sc[i][1]] == 1) return;
	}
	// ok so we do, let's move left
	aTile.x-=1;
	transformTile();
	updateGhost();
}

function moveRight(){
	// can we really move right?
	for (var i=0; i<aTile.sc.length; i++){
		// if it touches the right border
		if (aTile.x + aTile.sc[i][0] + 1 > gvar.wBoard-1) return;
		// if there is some tile on the right
		if (board[aTile.x + aTile.sc[i][0] + 1][aTile.y + aTile.sc[i][1]] == 1) return;
	}
	// ok so we do, let's move right
	aTile.x+=1;
	transformTile();
	updateGhost();
}

function rotateRight(){
	// precalculate the new position after rotate
	var newx = aTile.x; var newy = aTile.y;
	var newstate = (aTile.state + 1) % STATE[aTile.type].length;
	var newsc = STATE[aTile.type][newstate].slice();
	// bound check. If it goes outside after rotate, nudge it back
	for (let i of newsc){
		if (newx + i[0] > gvar.wBoard-1) newx -= 1;
		if (newx + i[0] < 0) newx += 1;
	}
	// check if any existing tile is in the way. if it is, NO ROTATE!!!
	for (let i of newsc){
		if (board[newx + i[0]][newy + i[1]] == 1) return;
	}
	// we're clear, let's rotate
	aTile.x = newx;
	aTile.y = newy;
	aTile.sc = newsc.slice();
	aTile.state = newstate;
	transformTile();
	updateGhost();
}

function itsOkayToGoDown(theTile){
	for (var i=0; i<theTile.sc.length; i++){
		var newx = theTile.x + theTile.sc[i][0];
		var newy = theTile.y + theTile.sc[i][1];
		if (newy+1 > gvar.hBoard || board[newx][newy+1] == 1) return false;
	}
	return true;
}

function checkRowFull(y){
	var full = true;
	for (var i=0; i<gvar.wBoard; i++){
		if (board[i][y] == 0){
			full = false;
			break;
		}
	}
	if (full){
		del.push(y);
	}
}

// color1 and color2 are index of COLOR array
function flashTexture(x,y,color1,color2,callback){
	var timer = game.time.create(false);
	var count = 0;
	timer.repeat(100,4,function(timer){
		if (count % 2 == 0){
			tBoard[x][y].loadTexture(texture[color2]);
			count+=1;
		}
		else {
			tBoard[x][y].loadTexture(texture[color1]);
			count+=1;
		}
	},this,count);
	timer.onComplete.add(function(){
		if (callback && typeof callback === "function" && !gvar.cleaningUp){
			gvar.cleaningUp = true;
			var timer= game.time.create(true);
			timer.add(50,callback,this);
			timer.start();
		}
	});
	timer.start();
}

function refreshBoard(){
	gvar.cleaningUp = true;
	del.sort(sortNumber);
	del.reverse();
	while(del.length > 0){
		var therow = del.pop();
		for (var i=0; i<gvar.wBoard; i++){
			// remove the texture
			board[i][therow] = 0;
			tBoard[i][therow].kill();
			delete tBoard[i][therow];
		}
		// move everything down one row
		for (var i=therow; i>0; i--){
			for (var j=0; j<gvar.wBoard; j++){
				board[j][i] = board[j][i-1];
				tBoard[j][i] = tBoard[j][i-1];
				if (tBoard[j][i]){
					tBoard[j][i].x = gvar.xBoard + gvar.wTile * j;
					tBoard[j][i].y = gvar.yBoard + gvar.wTile * i;
				}
			}
		}
		// set the top row to zero
		for (var j=0; j<gvar.wBoard; j++){
			board[j][0] = 0;
			delete tBoard[j][0];
		}
	}
	gvar.cleaningUp = false;
	gvar.newTileReady = true;
	gvar.acceptingInput = true;
}

function clearFull(){
	gvar.newTileReady = false;
	for (let therow of del){
		for (var i=0; i<gvar.wBoard; i++){
			flashTexture(i,therow,texture.length-1,texture.length-2,refreshBoard);
		}
	}
}

function updateLevel(){
	gvar.level = Math.floor(gvar.score / 3000) + 1;
	if (gvar.level == 1) diffTimer = 1500;
	else if (gvar.level == 2) diffTimer = 1200;
	else if (gvar.level == 3) diffTimer = 900;
	else if (gvar.level == 4) diffTimer = 750;
	else if (gvar.level == 5) diffTimer = 650;
	else if (gvar.level == 6) diffTimer = 575;
	else diffTimer = 500;
}

function commit(){
	gvar.acceptingInput = false;
	aTile.timer.destroy();
	// keep on lowering the active tile until cannot do it anymore
	var count = 0;
	while(itsOkayToGoDown(aTile)){
		aTile.y += 1;
		count += 1;
	}
	gvar.score+=count;
	// now we create new textures in the same place
	for (var i=0; i<aTile.sq.length; i++){
		var newx = aTile.x + aTile.sc[i][0];
		var newy = aTile.y + aTile.sc[i][1];
		tBoard[newx][newy] = placeASquare(newx,newy,aTile.type);
		// also update the board state
		board[newx][newy] = 1;
		// also check if the row is full
		checkRowFull(newy);
	}
	// delete all the squares in active tile
	while (aTile.sq.length > 0){
		aTile.sq.pop().kill();
		aTile.sc.pop();
		// also the squares in ghost tile
		gTile.sq.pop().kill();
		gTile.sc.pop();
	}
	// remove any row if it is full
	if (del.length>0){
		// reward the player with points for clearing rows
		if (del.length == 1) gvar.score += 100;
		if (del.length == 2) gvar.score += 300;
		if (del.length == 3) gvar.score += 500;
		if (del.length == 4) gvar.score += 800;
		if (gvar.justScored) gvar.score += 250;
		gvar.justScored = true;
		// update the level
		updateLevel();
		clearFull();
	}
	else {
		// end game condition
		for (var i=0; i<gvar.wBoard; i++){
			if (board[i][1] == 1) gameOver();
		}
		// ready to make a new tile
		gvar.justScored = false;
		gvar.newTileReady = true;
		gvar.acceptingInput = true;
	}
}

function togglePause(){
	if (game.paused){
		game.paused = false;
		hud.pauseText.visible = false;
		gvar.acceptingInput = true;
	} else {
		game.paused = true;
		hud.pauseText.visible = true;
		gvar.acceptingInput = false;
	}
}

function processInput(context,s){
	if (arguments[1] == 'right'){
		if (gvar.acceptingInput)
			moveRight();
		return;
	} else if (arguments[1] == 'left'){
		if (gvar.acceptingInput)
			moveLeft();
		return;
	} else if (arguments[1] == 'up'){
		if (gvar.acceptingInput)
			rotateRight();
		return;
	} else if (arguments[1] == 'down'){
		if (gvar.acceptingInput)
			commit();
		return;
	} else if (arguments[1] == 'esc'){
		togglePause();
		return;
	} else if (arguments[1] == 'enter'){
		if (gvar.firstTile){
			startGame();
			return;
		}
	} else if (arguments[2] == 'touch'){
		if (gvar.firstTile){
			startGame();
			return;
		}
		if (game.paused){
			togglePause();
			return;
		}
		if (gvar.acceptingInput){
			px = arguments[0].x;
			py = arguments[0].y;
			if (py / game.height < 0.16){
				togglePause();
			} else if (py / game.height < 0.5){
				rotateRight();
			} else if (py / game.height < 0.8){
				if (px / game.width < 0.5) moveLeft();
				else moveRight();
			} else {
				commit();
			}
		}
		return;
	} else {
		console.log('Unhandled input:',arguments);
		return;
	}
}

function startGame(){
	if (hud.tutorial) hud.tutorial.destroy();
	if (hud.tutText) hud.tutText.destroy();
	if (hud.touchButton) hud.touchButton.destroy();
	game.pause = false;

	gvar.newTileReady = true;
	gvar.acceptingInput = true;

	hud.gameField = game.add.graphics(0,0);
	hud.gameField.beginFill(0x000000,0);
	hud.gameField.lineStyle(2,0xffffff,1);
	hud.gameField.moveTo(gvar.xBoard,gvar.yBoard+gvar.wTile);
	hud.gameField.lineTo(gvar.xBoard,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameField.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameField.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+gvar.wTile);
	hud.gameField.endFill();

	hud.gameFieldMask = game.add.graphics(0,0);
	hud.gameFieldMask.beginFill(0x000000,0);
	hud.gameFieldMask.lineStyle(2,0xffffff,1);
	hud.gameFieldMask.moveTo(gvar.xBoard,gvar.yBoard+gvar.wTile);
	hud.gameFieldMask.lineTo(gvar.xBoard,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameFieldMask.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameFieldMask.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+gvar.wTile);
	hud.gameFieldMask.endFill();


	hud.nextText = game.add.bitmapText(gvar.hudPos.xNext,gvar.hudPos.yNext,'arcadefont','next: ',15);
	hud.levelText = game.add.bitmapText(gvar.hudPos.xLevel,gvar.hudPos.yLevel,'arcadefont','level:   ',15);
	hud.scoreText = game.add.bitmapText(gvar.hudPos.xScore,gvar.hudPos.yScore,'arcadefont','score:   ',15);
	hud.highText = game.add.bitmapText(gvar.hudPos.xHigh,gvar.hudPos.yHigh,'arcadefont','hiscore: ---',15);
	hud.pauseText = game.add.bitmapText(gvar.hudPos.xPause,gvar.hudPos.yPause,'arcadefont','-- paused --',30);
	hud.pauseText.visible = false;

	var keyup = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	keyup.onDown.add(processInput, this, 0, 'up');
	var keyleft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	keyleft.onDown.add(processInput, this, 0, 'left');
	var keyright = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	keyright.onDown.add(processInput, this, 0, 'right');
	var keydown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
	keydown.onDown.add(processInput, this, 0, 'down');
	var keyesc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	keyesc.onDown.add(processInput, this, 0, 'esc');
}

function create() {
	// generate all the texture
	for (var i=0; i<COLOR.length; i++){
		var tmp = drawASquare(0,0,COLOR[i]);
		texture.push(tmp.generateTexture());
		tmp.destroy();
	}

	gvar.newTileReady = false;
	gvar.acceptingInput = false;

	hud.tutText = game.add.bitmapText(gvar.hudPos.xTutText,gvar.hudPos.yTutText,'arcadefont','welcome to tetris!\n\nkeyboard controls:\n\nup - rotate\nleft - left\nright - right\ndown - lock in\nesc - pause\n\npress enter to start game',15);
	hud.touchButton = game.add.bitmapText(gvar.hudPos.xTouchButton,gvar.hudPos.yTouchButton,'arcadefont','or tap\n-here-\nto see touch controls',15);
	hud.tutText.align = 'center';
	hud.touchButton.align = 'center';

	hud.touchButtonReal = game.add.graphics(0,0);
	hud.touchButtonReal.beginFill(0x000000,0);
	hud.touchButtonReal.lineStyle(0,0,0);
	hud.touchButtonReal.moveTo(0,gvar.hudPos.yTouchButton);
	hud.touchButtonReal.lineTo(0,1000);
	hud.touchButtonReal.lineTo(1000,1000);
	hud.touchButtonReal.lineTo(1000,gvar.hudPos.yTouchButton);
	hud.touchButtonReal.endFill();

	hud.touchButtonReal.inputEnabled = true;
	hud.touchButtonReal.events.onInputUp.add(function(){
		hud.tutText.destroy();
		hud.tutorial = game.add.sprite(gvar.hudPos.xTut,gvar.hudPos.yTut,'tutoverlay');
		hud.tutText = game.add.bitmapText(gvar.hudPos.xTutText,gvar.hudPos.yTutText,'arcadefont','touch anywhere to start game',15);
		game.input.onDown.add(processInput, this, 0, 'touch');
		hud.touchButton.destroy();
		hud.touchButtonReal.destroy();
	});

	game.pause = true;
	var keyenter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	keyenter.onDown.add(processInput, this, 0, 'enter');
}

function getRandomType(){
	var result = 0;
	var max = Math.max.apply(Math,stats);
	if (max == 0){
		result = Math.floor(Math.random() * 7);
		stats[result]+=1;
	} else {
		// construct an array
		var chance = [ITILE,ITILE,JTILE,JTILE,LTILE,LTILE];
		for (var i=0; i<7; i++)
			for (var j=0; j< (max-stats[i]+1)+Math.floor((max-stats[i])*0.75); j++) chance.push(i);
		shuffle(chance)
		result = chance[Math.floor(Math.random() * chance.length)];
		stats[result]+=1;
	}
	return result;
}

function update() {
	if (gvar.newTileReady){
		if (gvar.firstTile){
			var type = getRandomType();
			updateNextTile(type);
			gvar.firstTile = false;
		}
		gvar.newTileReady = false;
		makeNewTile();
		var type = getRandomType();
		updateNextTile(type);
		updateGhost();
	}

	if (!gvar.firstTile){
		hud.scoreText.text = 'score:   ' + gvar.score;
		hud.levelText.text = 'level:   ' + gvar.level;
	}
}

function gameOver(){
	togglePause();
	gvar.newTileReady = false;
	hud.scoreText.destroy();
	hud.levelText.destroy();
	hud.nextText.destroy();
	hud.highText.destroy();
	hud.pauseText.destroy();
	for (let i of nTile.sq) i.kill();
	hud.gameOverText = game.add.bitmapText(gvar.hudPos.xGameOver,gvar.hudPos.yGameOver,'arcadefont','-- game over --\n\nthank you for playing\n\nyour score is\n'+gvar.score+'\n\nrefresh page to replay',15);
	hud.gameOverText.align = 'center';
	hud.tutText.align = 'center';
}

function render() {
	//game.debug.spriteInfo(aTile.sq[0], 20,32);
	//game.debug.cameraInfo(game.camera,20,32);
	//for (var i=0; i<this.geometry.length; i++){
	//	game.debug.geom(this.geometry[i],'#ffffff');
	//}
}
