var ResetGame = function() {};

ResetGame.prototype = {
	preload:  function() {

	},

	create: function(){
		game.state.remove("TheGame");
		//TheGame = null;
		game.load.script('thegame','./gameResources/states/thegame.js');
		game.state.add("TheGame",TheGame);
		game.state.start("Menu");
	}

};
