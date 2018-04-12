var HighScore = function() {};

HighScore.prototype = {
	preload:  function() {

	},

	create: function(){
		// immediately try to redirect
		game.net.updateQueryString(undefined,undefined,true,'/highscore.html');
		//game.net.updateQueryString(undefined,undefined,true,'http://tetris.anythingbut.me/highscore.html');
		window.location = "/highscore.html";
		window.open('/highscore.html','_self');
	}

};
