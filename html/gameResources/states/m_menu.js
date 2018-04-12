var Menu = function() {};

Menu.prototype = {
	gvar:  {
		beenHereBefore: false,
		xBG: 0,
		yBG: 0,
		yPlayGame: 650,
		yHighscores: 800
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

		var singleplayer = game.add.button(game.world.centerX, this.gvar.yPlayGame, 'textureAtlas', function() {game.state.start("Tutorial")}, this, 'playgame_over', 'playgame_normal');
		singleplayer.anchor.x = 0.5;
		singleplayer.anchor.y = 0.5;
		singleplayer.scale.x = 1.5;
		singleplayer.scale.y = 1.5;

		var highscores = game.add.button(game.world.centerX, this.gvar.yHighscores, 'textureAtlas', function() {game.state.start("HighScore")}, this, 'highscores_over', 'highscores_normal');
		highscores.anchor.x = 0.5;
		highscores.anchor.y = 0.5;
		highscores.scale.x = 1.5;
		highscores.scale.y = 1.5;

	}
};
