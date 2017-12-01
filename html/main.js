var game;
var
	Main = function () {},
	gameSettings = {
		gameWidth: 400,
		gameHeight: 600,
		xOffset: 0,
		yOffset: 0
	};

window.onload = function(){
	// get user's window width and height
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var ratio = windowWidth / windowHeight;
	// resize accordingly
	var newWidth = gameSettings.gameWidth;
	if (ratio > gameSettings.gameWidth / gameSettings.gameHeight){
		newWidth = gameSettings.gameHeight * ratio;
		gameSettings.xOffset = newWidth - gameSettings.gameWidth;
		gameSettings.gameWidth = newWidth;
	}
	if (ratio < gameSettings.gameWidth / gameSettings.gameHeight){
		newHeight = gameSettings.gameWidth / ratio;
		gameSettings.yOffset = newHeight - gameSettings.gameHeight;
		gameSettings.gameHeight = newHeight;
	}
	game = new Phaser.Game(gameSettings.gameWidth, gameSettings.gameHeight, Phaser.AUTO, '');
	game.state.add('Main', Main);
	game.state.start('Main');
};

Main.prototype = {

	preload: function () {
		game.load.image('stars',    './gameResources/assets/stars.jpg');
		game.load.image('loading',  './gameResources/assets/loading.png');
		game.load.image('brand',    './gameResources/assets/logo.png');
		game.load.script('splash',  './gameResources/states/splash.js');
	},

	create: function () {
		game.state.add('Splash', Splash);
		game.state.start('Splash');
	}

};

