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
		xNext: 620,
		yNext: 694,
		// hold tile position, in real pixels
		xHold: 20,
		yHold: 857,
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
			xPause: 350,
			yPause: 500,
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
			// back to menu button
			xBack: 350,
			yBack: 30,
			// Game Over text
			xGameOver: 35,
			yGameOver: 7,
			// boundaries of the touch inputs
			yHoriz1: 125,
			yHoriz2: 500,
			yHoriz3: 850,
			xSides: 100,
		},
		// tile size
		wTile: 50,
		// recently swap the tile with hold or not
		justSwapped: false,
		// accepting input or not
		acceptingInput: false,
		// force normal timer
		forceNormalTimer: false,
		// difficulty delay, changes accordingly as level increases
		diffDelay: 1500,
		// fast Delay, when player hold the Down button
		fastDelay: 50,
		// animation delay, how long to wait for animations to finish
		animDelay: 400,
		// current level
		level: 1,
		// current score
		score: 0,
		// score multiplier
		scoreMulti: 1,
		// back-to-back clearing should award more points
		justScored: false,
		// game ended?
		gameEnded: false,
		// high score
		highscore: '---',
		// group to store all the tile
		tiles: undefined,
		// group to store animations below the tile
		belowTiles: undefined,
		// list containing the commit animations
		commitAnims: [],
		// timekeeper
		timeKeeper: 0,
		// state of the game.
		// -1: game did not start
		// 0: creating new tile
		// 1: new tile created & active. normal timer.
		// 2: new tile created & active. fast timer.
		// 3: waiting for row clear
		// 4: paused
		status: -1
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
		nTile.current.scale.x = 1.7;
		nTile.current.scale.y = 1.7;
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
				gvar.status = 0;
			}
			// else, there is a currently held tile
			else {
				// delete current aTile
				while (aTile.sq.length > 0){
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
				gvar.timeKeeper = Date.now();
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
			hTile.current.scale.x = 1.7;
			hTile.current.scale.y = 1.7;
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

	function rotateLeft(){
		// precalculate the new position after rotate
		var newx = aTile.x; var newy = aTile.y;
		var newstate = (aTile.state + STATE[aTile.type].length - 1) % STATE[aTile.type].length;
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
		// check for bottom bound of the board
		for (let i of newsc){
			if (newy + i[1] > gvar.hBoard) return;
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
		// check for bottom bound of the board
		for (let i of newsc){
			if (newy + i[1] > gvar.hBoard) return;
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

		for (let therow of del){
			// add animations for all rows
			var rx = gvar.yBoard+(therow*gvar.wTile);
			var anim = game.add.sprite(0,rx,'rowclear_anim');
			anim.anchor.x = 0;
			anim.anchor.y = 0.33;
			//gvar.belowTiles.add(anim);
			var fade = anim.animations.add('fade');
			anim.animations.play('fade',60,false,true);
		}
	}

	function updateLevel(){
		// this is the whole gist of the difficulty settings
		if (gvar.score < 3000){ gvar.level=1; gvar.scoreMulti=1; gvar.diffDelay=1500; }
		else if (gvar.score < 6000){ gvar.level=2; gvar.scoreMulti=1; gvar.diffDelay=1000; }
		else if (gvar.score < 11000){ gvar.level=3; gvar.scoreMulti=2; gvar.diffDelay=750; }
		else if (gvar.score < 16000){ gvar.level=4; gvar.scoreMulti=2; gvar.diffDelay=650; }
		else if (gvar.score < 22000){ gvar.level=5; gvar.scoreMulti=3; gvar.diffDelay=600; }
		else if (gvar.score < 27000){ gvar.level=6; gvar.scoreMulti=3; gvar.diffDelay=550; }
		else if (gvar.score < 34000){ gvar.level=7; gvar.scoreMulti=4; gvar.diffDelay=500; }
		else if (gvar.score < 41000){ gvar.level=8; gvar.scoreMulti=4; gvar.diffDelay=450; }
		else if (gvar.score < 49000){ gvar.level=9; gvar.scoreMulti=5; gvar.diffDelay=400; }
		else if (gvar.score < 60000){ gvar.level=10; gvar.scoreMulti=5; gvar.diffDelay=350; }
		else {
			gvar.level = Math.floor((gvar.score-60000)/10000+11);
			gvar.scoreMulti = 6;
			gvar.diffDelay = 300;
		}
	}

	function commit(){
		// first, disable input and put timer on hold
		gvar.acceptingInput = false;
		gvar.status = 3;
		gvar.timeKeeper = Date.now();
		gvar.forceNormalTimer = true;
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
		} else {
			// end game condition
			for (var i=0; i<gvar.wBoard; i++){
				if (board[i][1] == 1) gameOver();
			}
			// ready to make a new tile
			gvar.justScored = false;
			gvar.status = 0;
		}
	}

	function togglePause(){
		if (game.paused){
			game.paused = false;
			hud.pauseText.visible = false;
			hud.backButton.visible = false;
			hud.scoreText.visible = true;
			gvar.acceptingInput = true;
			gvar.timeKeeper = Date.now();
		} else {
			game.paused = true;
			hud.pauseText.visible = true;
			hud.backButton.visible = true;
			hud.scoreText.visible = false;
			game.world.bringToTop(hud.pauseText);
			game.world.bringToTop(hud.backButton);
			gvar.acceptingInput = false;
		}
		console.log('time at pause:',gvar.timeKeeper);
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
		} else if (arguments[1] == 'esc'){
			togglePause();
			return;
		} else if (arguments[1] == 'space'){
			if (gvar.acceptingInput)
				commit();
			return;
		} else if (arguments[1] == 'shift'){
			if (gvar.acceptingInput)
				holdTile();
			return;
		} else if (arguments[2] == 'touch'){
			if (game.paused){
				py = arguments[0].y;
				if (py < 70) {
					togglePause();
					game.state.clearCurrentState();
					game.state.start("ResetGame");
				} else togglePause();
				return;
			}
			if (gvar.acceptingInput){
				px = arguments[0].x;
				py = arguments[0].y;
				if (py < gvar.hudPos.yHoriz1){
					// the top part: pause the game
					togglePause();
				} else if (py < gvar.hudPos.yHoriz2){
					// rotate the tile
					if (px / game.width < 0.5) rotateLeft();
					else rotateRight();
				} else if (py < gvar.hudPos.yHoriz3){
					// move the tile left or right
					if (px / game.width < 0.5) moveLeft();
					else moveRight();
				} else {
					// hold function
					if (px < gvar.hudPos.xSides) holdTile();
					if (px > gvar.gameWidth-gvar.hudPos.xSides) commit();
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

		// tutorial frame
		var tut = game.add.sprite(0,0,'tutorial_frame');
		tut.alpha = 0.8;
		var tuttween = game.add.tween(tut).to( {alpha: 0.2 }, 10000, Phaser.Easing.Exponential.Out, false )
		tuttween.onComplete.add(function(){
			var tween2 = game.add.tween(tut).to( {alpha: 0 }, 2000, Phaser.Easing.Linear.Out, false )
			tween2.onComplete.add(function(){tut.destroy();});
			tween2.start();
		});
		tuttween.start();

		// some starting variables
		game.pause = false;
		gvar.tiles = game.add.group();
		gvar.belowTiles = game.add.group();

		// game field background
		hud.gameField = game.add.sprite(gvar.hudPos.xTut,gvar.hudPos.yTut,'gamebg');

		// the texts
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
		hud.backButton = game.add.button(gvar.hudPos.xBack, gvar.hudPos.yBack,
			'textureAtlas',
			function() {
				togglePause();
				game.state.clearCurrentState();
				game.state.start("ResetGame");
			},
			this,
			'back_over', 'back_normal'
		);
		hud.backButton.anchor.x = 0.5;
		hud.backButton.anchor.y = 0.5;
		hud.backButton.scale.x = 0.7;
		hud.backButton.scale.y = 0.7;
		hud.backButton.visible = false;
		game.world.bringToTop(gvar.belowTiles);
		game.world.bringToTop(gvar.tiles);
		game.world.bringToTop(hud.scoreText);
		game.world.bringToTop(tut);

		// keyboard events
		var keyrotate = game.input.keyboard.addKey(gameSettings.p1Rotate[0]);
		keyrotate.onDown.add(processInput, this, 0, 'up');
		var keyleft = game.input.keyboard.addKey(gameSettings.p1Left[0]);
		keyleft.onDown.add(processInput, this, 0, 'left');
		var keyright = game.input.keyboard.addKey(gameSettings.p1Right[0]);
		keyright.onDown.add(processInput, this, 0, 'right');
		var keydowninsta = game.input.keyboard.addKey(gameSettings.p1DownInstant[0]);
		keydowninsta.onDown.add(processInput, this, 0, 'space');
		var keypause = game.input.keyboard.addKey(gameSettings.pauseButton[0]);
		keypause.onDown.add(processInput, this, 0, 'esc');
		var keyhold = game.input.keyboard.addKey(gameSettings.p1Hold[0]);
		keyhold.onDown.add(processInput, this, 0, 'shift');
		gvar.keydownslow = game.input.keyboard.addKey(gameSettings.p1DownSlow[0]);

		// touch events
		game.input.onDown.add(processInput, this, 0, 'touch');
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
		// inputs
		var pp = game.input.pointer1; var px = pp.x; var py = pp.y;
		if ((gvar.keydownslow.isDown && !gvar.forceNormalTimer && gvar.status == 1)
			|| (pp.isDown && py>gvar.hudPos.yHoriz3 && px>gvar.hudPos.xSides && px<gvar.gameWidth-gvar.hudPos.xSides
				&& !gvar.forceNormalTimer && gvar.status == 1)) {
			console.log("DOWNNNN");
			gvar.status = 2;
		}
		if ((gvar.keydownslow.isUp && gvar.status == 2)
			&& (pp.isUp && gvar.status == 2)) {
			console.log("UPPP");
			gvar.status = 1;
		}
		if ((gvar.keydownslow.isUp && gvar.status == 1 && gvar.forceNormalTimer)
			&& (pp.isUp && gvar.status == 1 && gvar.forceNormalTimer)){
			gvar.forceNormalTimer = false;
		}

		// if game hasn't started yet
		// or if a new tile needs to be created
		if (gvar.status <= 0){
			console.log('creating a new tile');
			if (gvar.status == -1){
				var type = getRandomType();
				updateNextTile(type);
			}
			makeNewTile(nTile.type);
			var type = getRandomType();
			updateNextTile(type);
			updateGhost();
			gvar.justSwapped = false;
			gvar.status = 1;
			gvar.acceptingInput = true;
			gvar.timeKeeper = Date.now();
		}

		// timer to lower the tile
		if (gvar.status == 1 && Date.now() - gvar.timeKeeper >= gvar.diffDelay){
			console.log('lowering the tile. normal delay');
			lowerTile();
			gvar.timeKeeper = Date.now();
		}
		if (gvar.status == 2 && Date.now() - gvar.timeKeeper >= gvar.fastDelay){
			console.log('lowering the tile. fast delay');
			gvar.score += 1*gvar.scoreMulti;
			lowerTile();
			gvar.timeKeeper = Date.now();
		}

		// timer to resume after commit
		if (gvar.status == 3 && Date.now() - gvar.timeKeeper >= gvar.animDelay){
			console.log('clearing full rows');
			clearFull();
			gvar.status = 0;
		}

		// update texts
		if (hud.scoreText.text != gvar.score){
			console.log('updating score text');
			hud.scoreText.text = gvar.score;
		}
		if (hud.levelText.text != gvar.level){
			console.log('updating level text');
			hud.levelText.text = gvar.level;
		}
	}

	function gameOver(){
		if (!gvar.gameEnded){
			gvar.gameEnded = true;
			localStorage.setItem('score',gvar.score);
			game.state.start("GameOver");
		}
	}

	this.render = function(){
		//this.game.debug.cameraInfo(this.game.camera, 32, 32);
		//game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
	}

};
