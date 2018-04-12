var game;
var
	Main = function () {},
	gameSettings = {
		gameWidth: 700,
		gameHeight: 1000,
		scaleRatio: 1,
		xOffset: 0,
		yOffset: 0,

		p1Left: [Phaser.Keyboard.LEFT, 'ArrowLeft'],
		p1Right: [Phaser.Keyboard.RIGHT, 'ArrowRight'],
		p1DownSlow: [Phaser.Keyboard.DOWN, 'ArrowDown'],
		p1DownInstant: [Phaser.Keyboard.SPACEBAR, 'Space'],
		p1Rotate: [Phaser.Keyboard.UP, 'ArrowUp'],
		p1Hold: [Phaser.Keyboard.SHIFT, 'Shift'],
		pauseButton: [Phaser.Keyboard.ESC, 'Escape'],
		rememberSettings: false
	};

window.onload = function(){
	// get user's window width and height
	game = new Phaser.Game(gameSettings.gameWidth, gameSettings.gameHeight, Phaser.AUTO, '');
	game.state.add('Main', Main);
	game.state.start('Main');

	// load saved settings if available
	if (localStorage.getItem('settings') !== null){
		gameSettings = JSON.parse(localStorage.getItem('settings'));
	}
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
		game.load.script('m_splash', './gameResources/states/m_splash.js');
	},

	create: function () {
		if(Phaser.Device.desktop){
			game.state.add('Splash', Splash);
		} else {
			game.state.add('Splash', M_Splash);
		}
		game.state.start('Splash');
	}

};
