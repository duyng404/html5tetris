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
		[[0,0], [0,-1], [0,1], [0,2]],
		[[0,0], [-1,0], [1,0], [2,0]]
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
	hBoard: 16,
	// top left corner of board (in pixels)
	xBoard: 0,
	yBoard: 150,
	// tile size
	wTile: 50,
	// ready to make a new tile or not
	newTileReady: false,
	// cleaning up board or not
	cleaningUp: false,
	// accepting input or not
	acceptingInput: false
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
	// state, depend on each individual tile
	state: 0
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
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

// current game board, but stores sprite
var tBoard = [[],[],[],[],[],[],[],[],[],[]];

// rows that are full and marked for deletion
var del = [];

// array of prefabs texture
var texture = [];

// statistics of how many tiles have created so far
var stats = [0,0,0,0,0,0,0];

window.onload = function(){
    // creation of the game itself
	game = new Phaser.Game(gvar.gameWidth, gvar.gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
}

function preload() {
	// resize so it fits the screen
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
	for (let i of aTile.sc){
		aTile.sq.push(placeASquare(gvar.xSpawn + i[0], gvar.ySpawn + i[1], type));
	}
	// other params
	aTile.state = 0;
	aTile.type = type;
	aTile.x = gvar.xSpawn;
	aTile.y = gvar.ySpawn;
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
	// keep on lowering the active tile until cannot do it anymore
	var count = 0;
	while(itsOkayToGoDown(aTile)){
		aTile.y += 1;
		count += 1;
	}
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
	if (del.length>0) clearFull();
	// ready to make a new tile
	else {
		gvar.newTileReady = true;
		gvar.acceptingInput = true;
	}
}

function processInput(context,s){
	switch(s){
		case 'right':
			if (gvar.acceptingInput)
				moveRight();
			break;
		case 'left':
			if (gvar.acceptingInput)
				moveLeft();
			break;
		case 'up':
			if (gvar.acceptingInput)
				rotateRight();
			break;
		case 'down':
			if (gvar.acceptingInput)
				commit();
			break;
		default:
			console.log('unhandled input:',s);
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

	var keyup = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	keyup.onDown.add(processInput, this, 0, 'up');
	var keyleft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	keyleft.onDown.add(processInput, this, 0, 'left');
	var keyright = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	keyright.onDown.add(processInput, this, 0, 'right');
	var keydown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
	keydown.onDown.add(processInput, this, 0, 'down');
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
		console.log(stats,chance,result);
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
}

function render() {
	//game.debug.spriteInfo(aTile.sq[0], 20,32);
	//game.debug.cameraInfo(game.camera,20,32);
	//for (var i=0; i<this.geometry.length; i++){
	//	game.debug.geom(this.geometry[i],'#ffffff');
	//}
}
