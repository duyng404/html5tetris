var GameOver = function() {};

GameOver.prototype = {
	preload:  function() {

	},

	create: function(){
		game.state.remove("TheGame");
		TheGame = null;

		// get current epoch
		$.get( "http://icanhazepoch.com", function(data) {
			// once got it, set the time
			var d = data*1000;
			localStorage.setItem('time',d);

			// immediately try to redirect
			game.net.updateQueryString(undefined,undefined,true,'/highscore.html');
			//game.net.updateQueryString(undefined,undefined,true,'http://tetris.anythingbut.me/highscore.html');
			window.location = "/highscore.html";
			window.open('/highscore.html','_self');
		});
	}

};
