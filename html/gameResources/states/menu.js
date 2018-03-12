var Menu = function() {};

Menu.prototype = {
	gvar:  {
		beenHereBefore: false,
		xBG: 0,
		yBG: 0,
		ySinglePlayer: 570,
		yCoop: 650,
		yWeekly: 730,
		ySettings: 810,
		yHighscores: 890
	},

	preload: function(){
		// fixes all the positions
		if (!this.gvar.beenHereBefore){
			this.gvar.beenHereBefore = true;
			for (var i in this.gvar){
				if (i.startsWith('x'))
					this.gvar[i] += gameSettings.xOffset / 2;
				if (i.startsWith('y'))
					this.gvar[i] += gameSettings.yOffset / 2;
			}
		}
	},

	create: function() {
		//console.log(game.device.desktop);

		game.add.sprite(this.gvar.xBG,this.gvar.yBG,'menubg');

		var singleplayer = game.add.button(game.world.centerX, this.gvar.ySinglePlayer, 'textureAtlas', function() {game.state.start("TheGame")}, this, 'singleplayer_over', 'singleplayer_normal');
		singleplayer.anchor.x = 0.5;
		singleplayer.anchor.y = 0.5;

		var localcoop = game.add.button(game.world.centerX, this.gvar.yCoop, 'textureAtlas', function() {game.state.start("TheGame")}, this, 'coop_over', 'coop_normal');
		localcoop.anchor.x = 0.5;
		localcoop.anchor.y = 0.5;

		var weekly = game.add.button(game.world.centerX, this.gvar.yWeekly, 'textureAtlas', function() {game.state.start("TheGame")}, this, 'weekly_over', 'weekly_normal');
		weekly.anchor.x = 0.5;
		weekly.anchor.y = 0.5;

		var settings = game.add.button(game.world.centerX, this.gvar.ySettings, 'textureAtlas', function() {game.state.start("TheGame")}, this, 'settings_over', 'settings_normal');
		settings.anchor.x = 0.5;
		settings.anchor.y = 0.5;

		var highscores = game.add.button(game.world.centerX, this.gvar.yHighscores, 'textureAtlas', function() {game.state.start("TheGame")}, this, 'highscores_over', 'highscores_normal');
		highscores.anchor.x = 0.5;
		highscores.anchor.y = 0.5;

		//var txt = game.add.bitmapText(this.gvar.xSetting, this.gvar.ySetting,'streamster','Settings',60);
		//txt.anchor.x = 0.5;
		//txt.anchor.y = 0.5;
		//txt.inputEnabled = true;
		//txt.events.onInputUp.add(function () { game.state.start("Settings") });

	}
};
