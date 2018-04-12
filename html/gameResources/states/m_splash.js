var M_Splash = function() {};

M_Splash.prototype = {
	gvar: {
		xBG: 0,
		yBG: 0
	},

	loadScripts: function () {
		game.load.script('m_menu','./gameResources/states/m_menu.js');
		game.load.script('m_thegame','./gameResources/states/m_thegame.js');
		game.load.script('m_tutorial','./gameResources/states/m_tutorial.js');
		game.load.script('gameover','./gameResources/states/gameover.js');
		game.load.script('highscore','./gameResources/states/highscore.js');
		game.load.script('m_resetgame','./gameResources/states/m_resetgame.js');
	},

	loadImages: function () {
		game.load.atlasJSONArray('textureAtlas','./gameResources/assets/texture.png','./gameResources/assets/texture.json');
		game.load.atlasJSONArray('bgAtlas','./gameResources/assets/bgs.png','./gameResources/assets/bgs.json');
		game.load.image('gamebg',    './gameResources/assets/m_gamebg.png');
		game.load.image('menubg',    './gameResources/assets/menubg.png');
		game.load.image('tutorialbg',    './gameResources/assets/tutorialbg.png');
		game.load.image('tutorial_frame',    './gameResources/assets/tutorial_frame.png');
		game.load.spritesheet('commit_anim','./gameResources/assets/commitanimation.png',50,900);
		game.load.spritesheet('rowclear_anim','./gameResources/assets/rowclearanimation.png',700,150);
	},

	loadFonts: function () {
		game.load.bitmapFont('primeblue','./gameResources/fonts/primeblue.png','./gameResources/fonts/primeblue.fnt');
		game.load.bitmapFont('primepink','./gameResources/fonts/primepink.png','./gameResources/fonts/primepink.fnt');
		game.load.bitmapFont('highscorefont','./gameResources/fonts/highscorefont.png','./gameResources/fonts/highscorefont.fnt');
	},

	// The preload function then will call all of the previously defined functions:
	preload: function () {
		for (var i in this.gvar){
			if (i.startsWith('x'))
				this.gvar[i] += gameSettings.xOffset / 2;
			if (i.startsWith('y'))
				this.gvar[i] += gameSettings.yOffset / 2;
		}

		game.add.sprite(this.gvar.xBG, this.gvar.yBG, 'loadingbg');

		this.loadingBar = game.add.sprite(game.world.centerX, 675, "loadingbar");
		this.loadingBar.anchor.setTo(0.5);
		this.load.setPreloadSprite(this.loadingBar);

		this.loadScripts();
		this.loadImages();
		this.loadFonts();
	},

	addGameStates: function () {
		game.state.add("Menu",Menu);
		game.state.add("TheGame",TheGame);
		game.state.add("GameOver",GameOver);
		game.state.add("HighScore",HighScore);
		game.state.add("ResetGame",ResetGame);
		game.state.add("Tutorial",Tutorial);
	},

	create: function() {
		//this.status.setText('Loading... Done!');
		this.addGameStates();
		game.state.start("Menu");
		//setTimeout(function () {
		//	game.state.start("Menu");
		//	}, 500);
  }
};
