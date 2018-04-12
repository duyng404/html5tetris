var Tutorial = function() {};

Tutorial.prototype = {
	preload:  function() {

	},

	create: function(){
		game.add.sprite(0,0,'tutorialbg');
		game.input.onDown.add(function(){
			game.state.start("TheGame");
		});
	}
};
