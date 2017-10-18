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
	// board sizes
	wBoard: 10,
	hBoard: 17,
	// top left corner of board (in pixels)
	xBoard: 0,
	yBoard: 100,
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
	justScored: false
};

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
	console.log(difference, gvar.xBoard);
    // creation of the game itself
	game = new Phaser.Game(gvar.gameWidth, gvar.gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
}

function preload() {
	game.load.bitmapFont('arcadefont','./arcadefont.png','./arcadefont.fnt');
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
	//console.log(a);
	return a;
	//return agame.add.sprite(rx,ry, texture[type]);
}

function makeNewTile(type){
	// get the first state of that type
	aTile.sc = STATE[type][0].slice();
	// put squares on screen according to the blueprint
	for (var i=0; i<aTile.sc.length; i++){
		aTile.sq.push(placeASquare(gvar.xSpawn + aTile.sc[i][0], gvar.ySpawn + aTile.sc[i][1], type));
		aTile.sq[i].mask = hud.gameFieldMask;
	}
	// other params
	aTile.state = 0;
	aTile.type = type;
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
	//console.log(type,STATE);
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
	//console.log(color1,color2,tBoard);
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
				//console.log(i,j)
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
		if (gvar.justScored) gvar.score += 500;
		gvar.justScored = true;
		clearFull();
	}
	// ready to make a new tile
	else {
		gvar.justScored = false;
		gvar.newTileReady = true;
		gvar.acceptingInput = true;
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
	} else if (arguments[2] == 'touch'){
		if (game.paused) game.paused = false;
		if (gvar.acceptingInput){
			px = arguments[0].x;
			py = arguments[0].y;
			if (py / game.height < 0.2){
				game.paused = true;
			} else if (py / game.height < 0.4){
				rotateRight();
			} else if (py / game.height < 0.7){
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

function create() {
	// generate all the texture
	for (var i=0; i<COLOR.length; i++){
		var tmp = drawASquare(0,0,COLOR[i]);
		texture.push(tmp.generateTexture());
		tmp.destroy();
	}

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

	hud.scoreText = game.add.bitmapText(32,32,'arcadefont','score: ',20);
	hud.levelText = game.add.bitmapText(32,56,'arcadefont','level: ',20);

	var keyup = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	keyup.onDown.add(processInput, this, 0, 'up');
	var keyleft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	keyleft.onDown.add(processInput, this, 0, 'left');
	var keyright = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	keyright.onDown.add(processInput, this, 0, 'right');
	var keydown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
	keydown.onDown.add(processInput, this, 0, 'down');
	game.input.onDown.add(processInput, this, 0, 'touch');
}

function getRandomType(){
	var result = 0;
	var max = Math.max.apply(Math,stats);
	if (max == 0){
		result = Math.floor(Math.random() * 7);
		stats[result]+=1;
	} else {
		// construct an array
		var chance = [0];
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
		gvar.newTileReady = false;
		//var type = Math.floor(Math.random() * 7);
		var type = getRandomType();
		makeNewTile(type);
		updateGhost();
	}

	hud.scoreText.text = 'score: ' + gvar.score;
	hud.levelText.text = 'level: ' + gvar.level;
}

function render() {
	//game.debug.spriteInfo(aTile.sq[0], 20,32);
	//game.debug.cameraInfo(game.camera,20,32);
	//for (var i=0; i<this.geometry.length; i++){
	//	game.debug.geom(this.geometry[i],'#ffffff');
	//}
}
