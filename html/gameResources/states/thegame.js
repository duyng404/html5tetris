var TheGame = function() {

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

	// global variables
	var gvar = {
		// game sizes
		gameWidth: 700,
		gameHeight: 1000,
		// spawn position
		xSpawn: 4,
		ySpawn: 1,
		// next tile position, in real pixels
		xNext: 20,
		yNext: 857,
		// hold tile position, in real pixels
		xHold: 625,
		yHold: 705,
		// board sizes
		wBoard: 10,
		hBoard: 17,
		// top left corner of board (in pixels)
		xBoard: 100,
		yBoard: 82,
		// position of HUD elements
		hudPos: {
			// Next text
			xNext: 35,
			yNext: 3,
			// Score text
			xScore: 350,
			yScore: 70,
			// Level text
			xLevel: 650,
			yLevel: 885,
			// Highscore text
			xHigh: 200,
			yHigh: 10,
			// Pause text
			xPause: 190,
			yPause: 300,
			// the touch tutorial image
			xTut: 0,
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
		wTile: 50,
		// recently swap the tile with hold or not
		justSwapped: false,
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
		highscore: '---',
		// group to store all the tile
		tiles: undefined,
		// group to store animations below the tile
		belowTiles: undefined,
		// list containing the commit animations
		commitAnims: []
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

	// the next tile: current tile, object pool, and the type
	var hTile = {
		current: undefined,
		pool: [],
		type: undefined
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

	this.preload = function(){
		// fix all the positions
		gvar.gameWidth = gameSettings.gameWidth;
		gvar.gameHeight = gameSettings.gameHeight;
		// showing fps
		game.time.advancedTiming = true;
	}

	function placeASquare(x, y, type){
		// calculate the "real" coordinate in pixels
		var rx = gvar.xBoard+(x*gvar.wTile);
		var ry = gvar.yBoard+(y*gvar.wTile);
		// are there any sprite of same type in the pool?
		if (pool[type].length > 0){
			// if yes then pop it then reset it
			var a = pool[type].pop();
			a.reset(rx,ry);
			return a;
		}
		else {
			// if not then create new
			var a = game.add.sprite(rx,ry, 'textureAtlas',TEXTURENAME[type]);
			gvar.tiles.add(a);
			return a;
		}
	}

	function updateNextTile(type){
		// kill the current one, if there is any
		if (nTile.current) nTile.current.kill();
		// if there is no same tile in the pool
		if (!nTile.pool[type])
			// then create it
			nTile.pool[type] = game.add.sprite(0,0,'textureAtlas','next'+TEXTURENAME[type]);
		// get from the pool and reset it
		nTile.current = nTile.pool[type];
		nTile.current.reset(gvar.xNext,gvar.yNext);
		// update the type
		nTile.type = type;
	}

	function makeNewTile(type){
		// get the type from next tile
		aTile.type = type;
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

	function holdTile(){
		if (!gvar.justSwapped){
			gvar.justSwapped = true;

			// if there isn't any hold Tile yet
			if (!hTile.current){
				// get Type from aTile
				hTile.type = aTile.type;
				// delete current aTile
				while (aTile.sq.length > 0){
					aTile.timer.destroy();
					var tmp = aTile.sq.pop();
					pool[aTile.type].push(tmp);
					tmp.kill();
					aTile.sc.pop();
					// also the ghost tile
					tmp = gTile.sq.pop();
					tmp.alpha = 1;
					pool[aTile.type].push(tmp);
					tmp.kill();
					gTile.sc.pop();
				}
				gvar.newTileReady = true;
			}
			// else, there is a currently held tile
			else {
				// delete current aTile
				while (aTile.sq.length > 0){
					aTile.timer.destroy();
					var tmp = aTile.sq.pop();
					pool[aTile.type].push(tmp);
					tmp.kill();
					aTile.sc.pop();
					// also the ghost tile
					tmp = gTile.sq.pop();
					tmp.alpha = 1;
					pool[aTile.type].push(tmp);
					tmp.kill();
					gTile.sc.pop();
				}
				// swap tile types
				var tmp = hTile.type;
				hTile.type = aTile.type;
				aTile.type = tmp;
				// make new tile
				makeNewTile(aTile.type);
				// update necessary stuff
				tmp = getRandomType();
				updateNextTile(tmp);
				updateGhost();
			}

			// kill the current one, if there is any
			if (hTile.current) hTile.current.kill();
			// if there is no same tile in the pool
			if (!hTile.pool[hTile.type])
				// then create it
				hTile.pool[hTile.type] = game.add.sprite(0,0,'textureAtlas','next'+TEXTURENAME[hTile.type]);
			// get from the pool and reset it
			hTile.current = hTile.pool[hTile.type];
			hTile.current.reset(gvar.xHold,gvar.yHold);
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
				pool[tBoard[i][therow].ztype].push(tBoard[i][therow]);
				tBoard[i][therow].kill();
				delete tBoard[i][therow];
			}

			// add animations for all rows
			var rx = gvar.yBoard+(therow*gvar.wTile);
			console.log(therow,rx);
			var anim = game.add.sprite(0,rx,'rowclear_anim');
			anim.anchor.x = 0;
			anim.anchor.y = 0.33;
			//gvar.belowTiles.add(anim);
			var fade = anim.animations.add('fade');
			anim.animations.play('fade',60,false,true);

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

	function addCommitAnim(x,y){
		var tmp = 0;
		for (let i of gvar.commitAnims){
			if (y > i[1])
				i[1] = y;
			if (x > i[0])
				tmp = 0;
			if (x < i[0])
				tmp = 1;
			if (x == i[0])
				return;
		}
		if (tmp == 0){
			gvar.commitAnims.push([x,y]);
		} else {
			gvar.commitAnims.unshift([x,y]);
		}
	}

	function startAllAnims(){
		var rx = gvar.xBoard+(gvar.commitAnims[0][0]*gvar.wTile);
		var ry = gvar.yBoard+(gvar.commitAnims[0][1]*gvar.wTile);
		var anim = game.add.sprite(rx,ry,'commit_anim');
		anim.anchor.x = 0;
		anim.anchor.y = 1;
		anim.scale.x = anim.scale.x * gvar.commitAnims.length;
		gvar.belowTiles.add(anim);
		var fade = anim.animations.add('fade');
		anim.animations.play('fade',60,false,true);
		gvar.commitAnims = [];
	}

	function updateLevel(){
		// this is the whole gist of the difficulty settings
		if (gvar.score < 3000){ gvar.level=69; gvar.scoreMulti=1; gvar.diffTimer=1500; }
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
			tBoard[newx][newy].ztype = aTile.type;
			// also update the board state
			board[newx][newy] = 1;
			// add a commit animation
			addCommitAnim(newx,newy);
			// also check if the row is full
			checkRowFull(newy);
		}
		// start all the animations
		startAllAnims();
		// delete all the squares in active tile
		while (aTile.sq.length > 0){
			var tmp = aTile.sq.pop();
			pool[aTile.type].push(tmp);
			tmp.kill();
			aTile.sc.pop();
			// also the squares in ghost tile
			tmp = gTile.sq.pop();
			tmp.alpha = 1;
			pool[aTile.type].push(tmp);
			tmp.kill();
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
			game.world.bringToTop(hud.pauseText);
			gvar.acceptingInput = false;
		}
	}

	function processInput(context,s){
		if (arguments[1] == 'right'){
			if (gvar.acceptingInput){
				moveRight();
			}
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
		} else if (arguments[1] == 'shift'){
			if (gvar.acceptingInput)
				holdTile();
			return;
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

	this.create = function(){
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
		gvar.tiles = game.add.group();
		gvar.belowTiles = game.add.group();

		hud.gameField = game.add.sprite(gvar.hudPos.xTut,gvar.hudPos.yTut,'gamebg');

		// the four lines showing the boundaries of the board
		//hud.gameField = game.add.graphics(0,0);
		//hud.gameField.beginFill(0x000000,0);
		//hud.gameField.lineStyle(2,0xffffff,1);
		//hud.gameField.moveTo(gvar.xBoard,gvar.yBoard+gvar.wTile);
		//hud.gameField.lineTo(gvar.xBoard,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
		//hud.gameField.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
		//hud.gameField.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+gvar.wTile);
		//hud.gameField.endFill();

		// the mask of the board for the active tile
		//hud.gameFieldMask = game.add.graphics(0,0);
		//hud.gameFieldMask.beginFill(0x000000,0);
		//hud.gameFieldMask.lineStyle(2,0xffffff,1);
		//hud.gameFieldMask.moveTo(gvar.xBoard,gvar.yBoard+gvar.wTile);
		//hud.gameFieldMask.lineTo(gvar.xBoard,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
		//hud.gameFieldMask.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+(gvar.hBoard+1)*gvar.wTile);
		//hud.gameFieldMask.lineTo(gvar.xBoard+gvar.wBoard*gvar.wTile,gvar.yBoard+gvar.wTile);
		//hud.gameFieldMask.endFill();

		// get the highscore from a GET query
		//$.get( "/z/getHighScore", function( data ) {
		//	if (data.weekly){
		//		var weekly = data.weekly;
		//		weekly.sort(function(a,b){
		//			return b.score - a.score;
		//		});
		//		gvar.highscore = weekly[0].score;
		//	}
		//});

		// the texts up top
		//hud.nextText = game.add.bitmapText(gvar.hudPos.xNext,gvar.hudPos.yNext,'arcadefont','next: ',15);
		hud.levelText = game.add.bitmapText(gvar.hudPos.xLevel,gvar.hudPos.yLevel,'highscorefont','1',50);
		hud.levelText.anchor.x = 0.5;
		hud.levelText.anchor.y = 0.5;
		hud.scoreText = game.add.bitmapText(gvar.hudPos.xScore,gvar.hudPos.yScore,'highscorefont','0',100);
		hud.scoreText.anchor.x = 0.5;
		hud.scoreText.anchor.y = 0.5;
		hud.pauseText = game.add.sprite(gvar.hudPos.xPause,gvar.hudPos.yPause,'textureAtlas','paused');
		hud.pauseText.anchor.x = 0.5;
		hud.pauseText.anchor.y = 0.5;
		hud.pauseText.visible = false;
		game.world.bringToTop(gvar.belowTiles);
		game.world.bringToTop(gvar.tiles);
		game.world.bringToTop(hud.scoreText);

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
		var keyshift = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
		keyshift.onDown.add(processInput, this, 0, 'shift');
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

	this.update = function(){
		if (gvar.newTileReady){
			if (gvar.firstTile){
				var type = getRandomType();
				updateNextTile(type);
				gvar.firstTile = false;
			}
			gvar.newTileReady = false;
			gvar.justSwapped = false;
			makeNewTile(nTile.type);
			var type = getRandomType();
			updateNextTile(type);
			updateGhost();
		}

		if (!gvar.firstTile){
			if (hud.scoreText.text != gvar.score)
				hud.scoreText.text = gvar.score;
			if (hud.levelText.text != gvar.level)
				hud.levelText.text = gvar.level;
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

	this.render = function(){
		this.game.debug.cameraInfo(this.game.camera, 32, 32);
		game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
	}

};
//var TheGame = function() {
//	var gvar =  {
//		beenHereBefore: false,
//		xBG: 0,
//		yBG: 0,
//		xStart: 200,
//		yStart: 350
//	};
//
//	const SOMETHING = "abcdef";
//
//	this.preload = function(){
//		// fixes all the positions
//		if (!gvar.beenHereBefore){
//			gvar.beenHereBefore = true;
//			for (var i in gvar){
//				if (i.startsWith('x'))
//					gvar[i] += gameSettings.xOffset / 2;
//				if (i.startsWith('y'))
//					gvar[i] += gameSettings.yOffset / 2;
//			}
//		}
//	}
//
//	function printtest(){
//		var txt = game.add.bitmapText(gvar.xStart, gvar.yStart,'streamster',SOMETHING,60);
//		txt.anchor.x = 0.5;
//		txt.anchor.y = 0.5;
//	}
//
//	this.create = function() {
//		game.add.sprite(gvar.xBG,gvar.yBG,'theatlas','menubg');
//		printtest();
//	}
//
//};
