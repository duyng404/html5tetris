var game;
var
	Main = function () {},
	gameSettings = {
		gameWidth: 700,
		gameHeight: 1000,
		scaleRatio: 1,
		xOffset: 0,
		yOffset: 0
	};

window.onload = function(){
	// get user's window width and height
	game = new Phaser.Game(gameSettings.gameWidth, gameSettings.gameHeight, Phaser.AUTO, '');
	game.state.add('Main', Main);
	game.state.start('Main');
};

Main.prototype = {

	preload: function () {
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true
		game.scale.refresh();
		game.load.image('loadingbg', './gameResources/assets/loadingbg.jpg');
		game.load.image('loadingbar', './gameResources/assets/loadingbar.png');
		game.load.script('splash', './gameResources/states/splash.js');
	},

	create: function () {
		game.state.add('Splash', Splash);
		game.state.start('Splash');
	}

};
