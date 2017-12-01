var Splash = function() {};

Splash.prototype = {

	loadScripts: function () {
		game.load.script('menu','./gameResources/states/menu.js');
		game.load.script('thegame','./gameResources/states/tetris.js');
		game.load.script('gameover','./gameResources/states/gameover.js');
		game.load.script('settings','./gameResources/states/settings.js');
	},

	loadImages: function () {
		game.load.atlasJSONArray('theatlas','./gameResources/assets/texture.png','./gameResources/assets/texture.json');
	},

	loadFonts: function () {
		game.load.bitmapFont('exofont','./gameResources/fonts/exofont.png','./gameResources/fonts/exofont.fnt');
		game.load.bitmapFont('exofontsmall','./gameResources/fonts/exofontsmall.png','./gameResources/fonts/exofontsmall.fnt');
		game.load.bitmapFont('streamster','./gameResources/fonts/streamster.png','./gameResources/fonts/streamster.fnt');
	},

	// The preload function then will call all of the previously defined functions:
	preload: function () {
		game.add.sprite(0, 0, 'stars');

		this.myLogo = game.add.sprite(game.world.centerX, 100, 'brand');
		this.myLogo.anchor.setTo(0.5);
		this.myLogo.scale.setTo(0.5);

		this.status = game.add.text(game.world.centerX, 380, 'Loading...', {fill: 'white'});
		this.status.anchor.setTo(0.5);

		this.loadingBar = game.add.sprite(game.world.centerX, 400, "loading");
		this.loadingBar.anchor.setTo(0.5);
		this.load.setPreloadSprite(this.loadingBar);

		this.loadScripts();
		this.loadImages();
		this.loadFonts();
	},

	addGameStates: function () {
		game.state.add("Menu",Menu);
		//game.state.add("Game",Game);
		game.state.add("GameOver",GameOver);
		game.state.add("Settings",Settings);
	},

	create: function() {
		this.status.setText('Loading... Done!');
		this.addGameStates();
		game.state.start("Menu");
		//setTimeout(function () {
		//	game.state.start("Menu");
		//	}, 500);
  }
};
