// javascript doesn't have a sort number functions so here it is
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
const TEXTURENAME=['itile','jtile','ltile','otile','stile','ttile','ztile','whitetile','blacktile'];
// tile colors according to the tile. The 2 last ones are for flashing when rows are cleared
//const COLOR=[0x05B7B1,0x1755D7,0xFC8E1F,0xFEF63C,0x24E767,0x9D37FA,0xFF3A3E,0xFFFFFF,0x000000];

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

// this is used to store the game itself
var game;

// global variables
var gvar = {
    // game sizes
    gameWidth: 360,
	gameHeight: 600,
	// spawn position
	xSpawn: 4,
	ySpawn: 1,
	// next tile position, in real pixels
	xNext: 60,
	yNext: 17,
	// board sizes
	wBoard: 10,
	hBoard: 17,
	// top left corner of board (in pixels)
	xBoard: 30,
	yBoard: 60,
	// position of HUD elements
	hudPos: {
		// Next text
		xNext: 35,
		yNext: 3,
		// Score text
		xScore: 140,
		yScore: 12,
		// Level text
		xLevel: 140,
		yLevel: 30,
		// Highscore text
		xHigh: 140,
		yHigh: 47,
		// Pause text
		xPause: 62,
		yPause: 250,
		// the touch tutorial image
		xTut: 25,
		yTut: 0,
		// welcome message text
		xTutText: 60,
		yTutText: 175,
		// message that says "tap here for touch input"
		xTouchButton: 70,
		yTouchButton: 300,
		// message that says "tap here for highscore"
		xHSButton: 80,
		yHSButton: 375,
		// Game Over text
		xGameOver: 35,
		yGameOver: 7,
		// boundaries of the touch inputs
		yControlPause: 80,
		yControlRotate: 300,
		yControlLR: 450,
	},
	// tile size
	wTile: 30,
	// ready to make a new tile or not
	newTileReady: false,
	// accepting input or not
	acceptingInput: false,
	// difficultyTimer, changes accordingly as level increases
	diffTimer: 1500,
	// current level
	level: 1,
	// current score
	score: 0,
	// score multiplier
	scoreMulti: 1,
	// back-to-back clearing should award more points
	justScored: false,
	// is this the first tile ever?
	firstTile: true,
	// game ended?
	gameEnded: false,
	// high score
	highscore: '---'
};

// information of the active tile
var aTile = {
	// all the squares of the active tile
	sq: [],
	// position all the squares, relative to pivot point
	sc: [],
	// position of the pivot point (in the board)
	x: 0,
	y: 0,
	// type
	type: 0,
	// state, depend on what type it is
	state: 0,
	// the timer that lowers the tile down periodically
	timer: undefined
};

// the next tile: current tile, object pool, and the type
var nTile = {
	current: undefined,
	pool: [],
	type: 0
}

// information of the ghost tile
var gTile = {
	sq: [],
	sc: [],
	x: 0,
	y: 0
}

// current game board
var board = [ // 10x18
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

// object pool
var pool = [[],[],[],[],[],[],[],[],[],[]];

// texts and information display in the game
var hud = {};

// on window load, determine the width and height to resize the game area accordingly
window.onload = function(){
	// get user's window width and height
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var ratio = windowWidth / windowHeight;
	// resize accordingly
	var newWidth = gvar.gameWidth;
	if (ratio > gvar.gameWidth / gvar.gameHeight){
		newWidth = gvar.gameHeight * ratio;
		var difference = newWidth - gvar.gameWidth;
		gvar.gameWidth = newWidth;
		// also move other elements in place
		gvar.xBoard += difference / 2;
		gvar.xNext += difference / 2;
		for (var i in gvar.hudPos){
			if (i.startsWith('x'))
				gvar.hudPos[i] += difference / 2;
		}
	}
	if (ratio < gvar.gameWidth / gvar.gameHeight){
		newHeight = gvar.gameWidth / ratio;
		var difference = newHeight - gvar.gameHeight;
		gvar.gameHeight = newHeight;
		gvar.yBoard += difference / 2;
		gvar.yNext += difference / 2;
		for (var i in gvar.hudPos){
			if (i.startsWith('y'))
				gvar.hudPos[i] += difference / 2;
		}
	}
    // creation of the game itself
	game = new Phaser.Game(gvar.gameWidth, gvar.gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});
}

function preload() {
	// showing fps
	game.time.advancedTiming = true;
	// load the atlas
	game.load.atlasJSONArray('theatlas','./gameResources/texture.png','./gameResources/texture.json');
	// the font
	game.load.bitmapFont('arcadefont','./gameResources/arcadefont.png','./gameResources/arcadefont.fnt');
	// resize so it fits the screen
	//game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
}

function placeASquare(x, y, type){
	// calculate the "real" coordinate in pixels
	var rx = gvar.xBoard+(x*gvar.wTile);
	var ry = gvar.yBoard+(y*gvar.wTile);
	// add the sprite in that place
	//var a = game.add.sprite(rx,ry, texture[type]);
	var a = game.add.sprite(rx,ry, 'theatlas',TEXTURENAME[type]);
	return a;
	//return agame.add.sprite(rx,ry, texture[type]);
}

function updateNextTile(type){
	// kill the current one, if there is any
	if (nTile.current) nTile.current.kill();
	// if there is no same tile in the pool
	if (!nTile.pool[type])
		// then create it
		nTile.pool[type] = game.add.sprite(0,0,'theatlas','next'+TEXTURENAME[type]);
	// get from the pool and reset it
	nTile.current = nTile.pool[type];
	nTile.current.reset(gvar.xNext,gvar.yNext);
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
		// if the place we are trying to place already has a tile, Game Over
		if (board[newx][newy] == 1) { gameOver(); break; }
		// push new square into sq
		aTile.sq.push(placeASquare(newx, newy, aTile.type));
		// apply the mask
		aTile.sq[i].mask = hud.gameFieldMask;
	}
	// other params
	aTile.state = 0;
	aTile.x = gvar.xSpawn;
	aTile.y = gvar.ySpawn;
	// attach a timer to slowly lower the tile
	aTile.timer = game.time.create(false);
	aTile.timer.loop(gvar.diffTimer,lowerTile,this);
	aTile.timer.start();
	gvar.acceptingInput = true;
}

function transformTile(){
	// update the squares of the tile to its new position
	for (var i=0; i<aTile.sq.length; i++){
		var newx = gvar.xBoard+gvar.wTile*(aTile.x + aTile.sc[i][0]);
		var newy = gvar.yBoard+gvar.wTile*(aTile.y + aTile.sc[i][1]);
		aTile.sq[i].x = gvar.xBoard+gvar.wTile*(aTile.x + aTile.sc[i][0]);
		aTile.sq[i].y = gvar.yBoard+gvar.wTile*(aTile.y + aTile.sc[i][1]);
	}
}

function updateGhost(){
	// if ghost doesn't exist, create it in the same position as aTile
	if (gTile.sq.length == 0){
		for (var i=0; i<aTile.sq.length; i++){
			var newx = aTile.x + aTile.sc[i][0];
			var newy = aTile.y + aTile.sc[i][1];
			gTile.sq.push(placeASquare(newx,newy,aTile.type));
			gTile.sq[i].alpha=0.3;
		}
		gTile.sc = aTile.sc.slice();
	}
	// if ghost did exist, move it back to same position as active tile
	else {
		for (var i=0; i<aTile.sq.length; i++){
			gTile.sq[i].x = aTile.sq[i].x;
			gTile.sq[i].y = aTile.sq[i].y;
		}
		gTile.sc = aTile.sc.slice();
	}
	gTile.x = aTile.x;
	gTile.y = aTile.y;
	// count how far it is from the bottom
	var count=0;
	while(itsOkayToGoDown(gTile)){
		gTile.y+=1;
		count+=1;
	}
	// move the squares down to the bottom
	for (let tile of gTile.sq){
		tile.y += count * gvar.wTile;
	}
}

// when the active tile's timer expires, this function will lower it down
function lowerTile(){
	// first, disable input
	gvar.acceptingInput = false;
	// move down one
	if (itsOkayToGoDown(aTile)){
		aTile.y += 1;
		for (let tile of aTile.sq){
			tile.y += gvar.wTile;
		}
	}
	// if cannot, then commit
	else {
		commit();
	}
	// enable input
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
	// also update the ghost tile
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
	// also update the ghost tile
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
	// also update the ghost tile
	updateGhost();
}

function itsOkayToGoDown(theTile){
	// basically check if the position right below have anything occyping already (or out of bound)
	for (var i=0; i<theTile.sc.length; i++){
		var newx = theTile.x + theTile.sc[i][0];
		var newy = theTile.y + theTile.sc[i][1];
		if (newy+1 > gvar.hBoard || board[newx][newy+1] == 1) return false;
	}
	return true;
}

function checkRowFull(y){
	// check if row y is full
	var full = true;
	for (var i=0; i<gvar.wBoard; i++){
		if (board[i][y] == 0){
			full = false;
			break;
		}
	}
	// if it is full, add it to the list to clear it later
	if (full){
		del.push(y);
	}
}

function clearFull(){
	// sort the del array from highest to lowest
	del.sort(sortNumber);
	del.reverse();
	// so we del the highest (nearer to the bottom) row first
	while(del.length > 0){
		var therow = del.pop();
		for (var i=0; i<gvar.wBoard; i++){
			// remove the squares
			board[i][therow] = 0;
			tBoard[i][therow].destroy();
			delete tBoard[i][therow];
		}
		// move the whole board down one row
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
		// set the top row to zero, just in case
		for (var j=0; j<gvar.wBoard; j++){
			board[j][0] = 0;
			delete tBoard[j][0];
		}
	}
	// continue the game
	gvar.newTileReady = true;
}

function updateLevel(){
	// this is the whole gist of the difficulty settings
	if (gvar.score < 3000){ gvar.level=1; gvar.scoreMulti=1; gvar.diffTimer=1500; }
	else if (gvar.score < 6000){ gvar.level=2; gvar.scoreMulti=1; gvar.diffTimer=1000; }
	else if (gvar.score < 11000){ gvar.level=3; gvar.scoreMulti=2; gvar.diffTimer=750; }
	else if (gvar.score < 16000){ gvar.level=4; gvar.scoreMulti=2; gvar.diffTimer=650; }
	else if (gvar.score < 22000){ gvar.level=5; gvar.scoreMulti=3; gvar.diffTimer=600; }
	else if (gvar.score < 27000){ gvar.level=6; gvar.scoreMulti=3; gvar.diffTimer=550; }
	else if (gvar.score < 34000){ gvar.level=7; gvar.scoreMulti=4; gvar.diffTimer=500; }
	else if (gvar.score < 41000){ gvar.level=8; gvar.scoreMulti=4; gvar.diffTimer=450; }
	else if (gvar.score < 49000){ gvar.level=9; gvar.scoreMulti=5; gvar.diffTimer=400; }
	else if (gvar.score < 60000){ gvar.level=10; gvar.scoreMulti=5; gvar.diffTimer=350; }
	else {
		gvar.level = Math.floor((gvar.score-60000)/10000+11);
		gvar.scoreMulti = 6;
		gvar.diffTimer = 300;
	}
}

function commit(){
	// first, disable input
	gvar.acceptingInput = false;
	// delete any timer on active tile
	aTile.timer.destroy();
	// calculate how far the active tile is from the bottom
	var count = 0;
	while(itsOkayToGoDown(aTile)){
		aTile.y += 1;
		count += 1;
	}
	// add that to the score
	gvar.score+=count*gvar.scoreMulti;
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
		aTile.sq.pop().destroy();
		aTile.sc.pop();
		// also the squares in ghost tile
		gTile.sq.pop().destroy();
		gTile.sc.pop();
	}
	// remove any row if it is full
	if (del.length>0){
		// reward the player with points for clearing rows
		if (del.length == 1) gvar.score += 100*gvar.scoreMulti;
		if (del.length == 2) gvar.score += 250*gvar.scoreMulti;
		if (del.length == 3) gvar.score += 500*gvar.scoreMulti;
		if (del.length == 4) gvar.score += 800*gvar.scoreMulti;
		if (gvar.justScored) gvar.score += 250*gvar.scoreMulti;
		gvar.justScored = true;
		// update the level
		updateLevel();
		// clear the full rows
		clearFull();
	} else {
		// end game condition
		for (var i=0; i<gvar.wBoard; i++){
			if (board[i][1] == 1) gameOver();
		}
		// ready to make a new tile
		gvar.justScored = false;
		gvar.newTileReady = true;
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
		// if game havent' started
		if (gvar.firstTile){
			// draw the touch guides on the sides
			touchGuide();
			// start the game
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
			if (py < gvar.hudPos.yControlPause){
				// the top part: pause the game
				togglePause();
			} else if (py < gvar.hudPos.yControlRotate){
				// rotate the tile
				rotateRight();
			} else if (py < gvar.hudPos.yControlLR){
				// move the tile left or right
				if (px / game.width < 0.5) moveLeft();
				else moveRight();
			} else {
				// commit the tile
				commit();
			}
		}
		return;
	} else {
		console.log('Unhandled input:',arguments);
		return;
	}
}

function touchGuide(){
	// the various lines and texts on the sides to show which touch region is which
	// i'm too lazy to comment everything in here
	hud.line1 = game.add.graphics(0,0);
	hud.line1.beginFill(0x000000,0);
	hud.line1.lineStyle(2,0xffffff,1);
	hud.line1.moveTo(gvar.xBoard-50,gvar.hudPos.yControlPause);
	hud.line1.lineTo(gvar.xBoard,gvar.hudPos.yControlPause);
	hud.line1.endFill();

	hud.line2 = game.add.graphics(0,0);
	hud.line2.beginFill(0x000000,0);
	hud.line2.lineStyle(2,0xffffff,1);
	hud.line2.moveTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.hudPos.yControlPause);
	hud.line2.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile+50,gvar.hudPos.yControlPause);
	hud.line2.endFill();

	hud.line3 = game.add.graphics(0,0);
	hud.line3.beginFill(0x000000,0);
	hud.line3.lineStyle(2,0xffffff,1);
	hud.line3.moveTo(gvar.xBoard-50,gvar.hudPos.yControlLR);
	hud.line3.lineTo(gvar.xBoard,gvar.hudPos.yControlLR);
	hud.line3.endFill();

	hud.line4 = game.add.graphics(0,0);
	hud.line4.beginFill(0x000000,0);
	hud.line4.lineStyle(2,0xffffff,1);
	hud.line4.moveTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.hudPos.yControlLR);
	hud.line4.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile+50,gvar.hudPos.yControlLR);
	hud.line4.endFill();

	hud.line5 = game.add.graphics(0,0);
	hud.line5.beginFill(0x000000,0);
	hud.line5.lineStyle(2,0xffffff,1);
	hud.line5.moveTo(gvar.xBoard-50,gvar.hudPos.yControlRotate);
	hud.line5.lineTo(gvar.xBoard,gvar.hudPos.yControlRotate);
	hud.line5.endFill();

	hud.line6 = game.add.graphics(0,0);
	hud.line6.beginFill(0x000000,0);
	hud.line6.lineStyle(2,0xffffff,1);
	hud.line6.moveTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.hudPos.yControlRotate);
	hud.line6.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile+50,gvar.hudPos.yControlRotate);
	hud.line6.endFill();

	hud.rotateText1 = game.add.bitmapText(gvar.xBoard-20,gvar.hudPos.yControlPause+100,'arcadefont','rotate',7);
	hud.rotateText1.anchor.setTo(0,0);
	hud.rotateText1.angle += 90;
	hud.rotateText2 = game.add.bitmapText(gvar.xBoard+gvar.wBoard*gvar.wTile+30,gvar.hudPos.yControlPause+100,'arcadefont','rotate',7);
	hud.rotateText2.anchor.setTo(1,1);
	hud.rotateText2.angle -= 90;

	hud.leftText = game.add.bitmapText(gvar.xBoard-20,gvar.hudPos.yControlRotate+100,'arcadefont','left',7);
	hud.leftText.anchor.setTo(0,0);
	hud.leftText.angle += 90;
	hud.rightText = game.add.bitmapText(gvar.xBoard+gvar.wBoard*gvar.wTile+30,gvar.hudPos.yControlRotate+100,'arcadefont','right',7);
	hud.rightText.anchor.setTo(1,1);
	hud.rightText.angle -= 90;

	hud.downText1 = game.add.bitmapText(gvar.xBoard-20,gvar.hudPos.yControlLR+25,'arcadefont','down',7);
	hud.downText1.anchor.setTo(0,0);
	hud.downText1.angle += 90;
	hud.downText2 = game.add.bitmapText(gvar.xBoard+gvar.wBoard*gvar.wTile+30,gvar.hudPos.yControlLR+25,'arcadefont','down',7);
	hud.downText2.anchor.setTo(1,1);
	hud.downText2.angle -= 90;
}

function create() {
	// destroy any unnecessary leftover HUD elements
	if (hud.tutorial) hud.tutorial.destroy();
	if (hud.tutText) hud.tutText.destroy();
	if (hud.touchButton) hud.touchButton.destroy();
	if (hud.touchButtonReal) hud.touchButtonReal.destroy();
	if (hud.HSButton) hud.HSButton.destroy();
	if (hud.HSButtonReal) hud.HSButtonReal.destroy();

	// some starting variables
	game.pause = false;
	gvar.newTileReady = true;
	gvar.acceptingInput = true;

	// the four lines showing the boundaries of the board
	hud.gameField = game.add.graphics(0,0);
	hud.gameField.beginFill(0x000000,0);
	hud.gameField.lineStyle(2,0xffffff,1);
	hud.gameField.moveTo(gvar.xBoard,gvar.yBoard+gvar.wTile);
	hud.gameField.lineTo(gvar.xBoard,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameField.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameField.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+gvar.wTile);
	hud.gameField.endFill();

	// the mask of the board for the active tile
	hud.gameFieldMask = game.add.graphics(0,0);
	hud.gameFieldMask.beginFill(0x000000,0);
	hud.gameFieldMask.lineStyle(2,0xffffff,1);
	hud.gameFieldMask.moveTo(gvar.xBoard,gvar.yBoard+gvar.wTile);
	hud.gameFieldMask.lineTo(gvar.xBoard,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameFieldMask.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
	hud.gameFieldMask.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+gvar.wTile);
	hud.gameFieldMask.endFill();

	// get the highscore from a GET query
	$.get( "/z/getHighScore", function( data ) {
		if (data.weekly){
			var weekly = data.weekly;
			weekly.sort(function(a,b){
				return b.score - a.score;
			});
			gvar.highscore = weekly[0].score;
		}
	});

	// the texts up top
	hud.nextText = game.add.bitmapText(gvar.hudPos.xNext,gvar.hudPos.yNext,'arcadefont','next: ',15);
	hud.levelText = game.add.bitmapText(gvar.hudPos.xLevel,gvar.hudPos.yLevel,'arcadefont','level:   ',15);
	hud.scoreText = game.add.bitmapText(gvar.hudPos.xScore,gvar.hudPos.yScore,'arcadefont','score:   ',15);
	hud.highText = game.add.bitmapText(gvar.hudPos.xHigh,gvar.hudPos.yHigh,'arcadefont','hiscore: '+gvar.highscore,15);
	hud.pauseText = game.add.bitmapText(gvar.hudPos.xPause,gvar.hudPos.yPause,'arcadefont','-- paused --',30);
	hud.pauseText.visible = false;

	// keyboard events
	var keyup = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	keyup.onDown.add(processInput, this, 0, 'up');
	var keyleft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	keyleft.onDown.add(processInput, this, 0, 'left');
	var keyright = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	keyright.onDown.add(processInput, this, 0, 'right');
	var keydown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
	keydown.onDown.add(processInput, this, 0, 'down');
	var keyspace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	keyspace.onDown.add(processInput, this, 0, 'down');
	var keyesc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	keyesc.onDown.add(processInput, this, 0, 'esc');
}

function getRandomType(){
	// this function will generate a random type for the next tile. Chances are dependant on difficulty
	var result = 0;
	var chance;
	// construct the chance array for the ratio of the tiles
	if (gvar.level < 8) { chance = [ITILE,ITILE,ITILE,JTILE,JTILE,LTILE,LTILE,OTILE,STILE,ZTILE,TTILE,TTILE]; }
	else if (gvar.level < 15) { chance = [ITILE,ITILE,JTILE,JTILE,LTILE,LTILE,OTILE,STILE,ZTILE,TTILE,TTILE]; }
	else if (gvar.level < 19) { chance = [ITILE,ITILE,JTILE,LTILE,OTILE,STILE,ZTILE,TTILE,TTILE]; }
	else if (gvar.level < 23){ chance = [ITILE,ITILE,JTILE,LTILE,OTILE,STILE,ZTILE,TTILE]; }
	else { chance = [ITILE,JTILE,LTILE,OTILE,STILE,ZTILE,TTILE]; }
	// make sure no same tile appear consecutively (only if level is < 8)
	for (var i=0; i<chance.length; i++){
		while (chance[i] == aTile.type){
			chance.splice(i,1);
		}
	}
	shuffle(chance);
	result = chance[Math.floor(Math.random() * chance.length)];
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
		hud.highText.text = 'hiscore: '+ gvar.highscore;
	}
}

function gameOver(){
	if (!gvar.gameEnded){
		gvar.gameEnded = true;
		togglePause();
		gvar.newTileReady = false;
		// destroy all the text and the next Tile
		hud.scoreText.destroy();
		hud.levelText.destroy();
		hud.nextText.destroy();
		hud.highText.destroy();
		hud.pauseText.destroy();
		for (let i of nTile.sq) i.kill();
		// show the game over text
		hud.gameOverText = game.add.bitmapText(gvar.hudPos.xGameOver,gvar.hudPos.yGameOver,'arcadefont','-- game over --\n\nthank you for playing\n\nyour score is\n'+gvar.score+'\n\nloading highscore in 2 seconds\n\nif page doesnt load\nclose and reopen tab',7);
		hud.gameOverText.align = 'center';
		hud.tutText.align = 'center';


		// get current epoch
		$.get( "http://icanhazepoch.com", function(data) {
			// immediately try to redirect
			localStorage.setItem('score',gvar.score);
			var d = data*1000;
			localStorage.setItem('time',d);
			game.net.updateQueryString(undefined,undefined,true,'/highscore.html');
			//game.net.updateQueryString(undefined,undefined,true,'http://tetris.anythingbut.me/highscore.html');
			//window.location = "http://tetris.anythingbut.me/highscore.html";
			//window.open('http://tetris.anythingbut.me/highscore.html','_self');
		});
	}
}

function render(){
	this.game.debug.cameraInfo(this.game.camera, 32, 32);
	game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
}
