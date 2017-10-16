// tile types
const ITILE=0; const JTILE=1; const LTILE=2; const OTILE=3; const STILE=4; const TTILE=5; const ZTILE=6;
const COLOR=[0x05B7B1,0x1755D7,0xFC8E1F,0xFEF63C,0x24E767,0x9D37FA,0xFF3A3E];
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
	yBoard: 200,
	// tile size
	wTile: 50
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
	type: 0
};

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
var tBoard = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];

// array of prefabs texture
var texture = []

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
	var rx = gvar.xBoard+(x*gvar.wTile)+1;
	var ry = gvar.yBoard+(y*gvar.wTile)+1;
	// make a graphic item and start to draw
	square = game.add.graphics(0,0);
	square.beginFill(color);
	square.lineStyle(0,0,0);
	square.moveTo(rx,ry);
	square.lineTo(rx+gvar.wTile-2,ry);
	square.lineTo(rx+gvar.wTile-2,ry+gvar.wTile-2);
	square.lineTo(rx,ry+gvar.wTile-2);
	square.lineTo(rx,ry);
	square.endFill();
	return square;
}

function placeASquare(x, y, type){
	// the "real" coordinate in pixels
	var rx = gvar.xBoard+(x*gvar.wTile)+1;
	var ry = gvar.yBoard+(y*gvar.wTile)+1;
	return game.add.sprite(rx,ry, texture[type]);
}

function makeatile(type){
	// draw the squares
	switch(type){
		case ITILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn-1, type));
			aTile.sc.push([0,-1]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn+1, type));
			aTile.sc.push([0,1]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn+2, type));
			aTile.sc.push([0,2]);
			break;
		case JTILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn-1, gvar.ySpawn, type));
			aTile.sc.push([-1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn, type));
			aTile.sc.push([1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn+1, type));
			aTile.sc.push([1,1]);
			break;
		case LTILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn-1, gvar.ySpawn, type));
			aTile.sc.push([-1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn, type));
			aTile.sc.push([1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn-1, gvar.ySpawn+1, type));
			aTile.sc.push([-1,1]);
			break;
		case OTILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn, type));
			aTile.sc.push([1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn+1, type));
			aTile.sc.push([0,1]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn+1, type));
			aTile.sc.push([1,1]);
			break;
		case STILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn, type));
			aTile.sc.push([1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn+1, type));
			aTile.sc.push([0,1]);
			aTile.sq.push(placeASquare(gvar.xSpawn-1, gvar.ySpawn+1, type));
			aTile.sc.push([-1,1]);
			break;
		case TTILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn-1, gvar.ySpawn, type));
			aTile.sc.push([-1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn, type));
			aTile.sc.push([1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn+1, type));
			aTile.sc.push([0,1]);
			break;
		case ZTILE:
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn, type));
			aTile.sc.push([0,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn-1, gvar.ySpawn, type));
			aTile.sc.push([-1,0]);
			aTile.sq.push(placeASquare(gvar.xSpawn, gvar.ySpawn+1, type));
			aTile.sc.push([0,1]);
			aTile.sq.push(placeASquare(gvar.xSpawn+1, gvar.ySpawn+1, type));
			aTile.sc.push([1,1]);
			break;
		default:
	}
	// update general info
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
}

function rotateRight(){
	// no rotation for O-tile!!
	if (aTile.type == OTILE) return;
	// precalculate the new position after rotating
	var newx = aTile.x; var newy = aTile.y;
	var newsc = [];
	for (var i=0; i<aTile.sc.length; i++){
		newsc.push([- aTile.sc[i][1],aTile.sc[i][0]]);
		// bound check. If it goes outside after rotate, nudge it back
		if (newx + newsc[i][0] > gvar.wBoard-1) newx -= 1;
		if (newx + newsc[i][0] < 0) newx += 1;
	}
	// check if any existing tile is in the way
	for (var i=0; i<aTile.sc.length; i++){
		if (board[newx + newsc[i][0]][newy + newsc[i][1]] == 1) return;
	}
	// we're clear, let's rotate
	aTile.x = newx;
	aTile.y = newy;
	aTile.sc = newsc;
	transformTile();
}

function itsOkayToGoDown(){
	for (var i=0; i<aTile.sc.length; i++){
		var newx = aTile.x + aTile.sc[i][0];
		var newy = aTile.y + aTile.sc[i][1];
		if (newy+1 > gvar.hBoard-1 || board[newx][newy+1] == 1) return false;
	}
	return true;
}

function commit(){
	// keep on lowering the active tile until cannot do it anymore
	var count = 0;
	while(itsOkayToGoDown()){
		aTile.y += 1;
		count += 1;
	}
	transformTile();
	// now we create new textures in the same place
	//tBoard[0,1] = placeASquare(16,9,2);
}

function create() {
	// generate all the texture
	for (var i=0; i<COLOR.length; i++){
		var tmp = drawASquare(0,0,COLOR[i]);
		texture.push(tmp.generateTexture());
		tmp.destroy();
	}

	makeatile(ZTILE);

	//var keyup = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	//keyup.onDown.add(function(){
	//	rotateTween = game.add.tween(aTile.sq).to( {angle: aTile.sq.angle+90}, 50, Phaser.Easing.Linear.None, true );
	//}, this);
	var keyup = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	keyup.onDown.add(rotateRight, this);
	var keyleft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	keyleft.onDown.add(moveLeft, this);
	var keyright = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	keyright.onDown.add(moveRight, this);
	var keydown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
	keydown.onDown.add(commit, this);
}

function update() {
}

function render() {
	//game.debug.spriteInfo(ship, 20,32);
	game.debug.cameraInfo(game.camera,20,32);
	//for (var i=0; i<this.geometry.length; i++){
	//	game.debug.geom(this.geometry[i],'#ffffff');
	//}
}
