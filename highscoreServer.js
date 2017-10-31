// all the requires
var jsonfile = require('jsonfile');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var app = express();

// the highscore database is only a json file at root
//const HIGHSCOREFILE = './highscore.json'
const HIGHSCOREFILE = path.join(__dirname,'/highscore.json');

// this server gonna run on this port
app.set('port', 8080);

// logging out all the access
//app.use(function(req, res, next){
//	console.log(req.method, req.url);
//	next();
//});

// static directory
app.use(express.static(path.join(__dirname, 'html')));
// node modules
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')));
// enable parser so it can read POST
app.use(bodyParser.urlencoded({ extended: false }));;
app.use(bodyParser.json());


// api for getting score
app.
	route('/z/getHighScore').
	get(getHighScore);

// api for posting score
app.
	route('/z/postHighScore').
	post(postHighScore);

// api for updating entries
app.
	route('/z/updateHighScore').
	post(updateHighScore);

// get the lowest score in a scoreboard (alltime or weekly). Return the index only.
function getLowest(scoreboard){
	min = 0;
	for (var i=1; i<scoreboard.length; i++){
		if (parseInt(scoreboard[i].score) < parseInt(scoreboard[min].score))
			min=i;
	}
	return min;
}

// Getting all the scores. Filtering out the anonymous.
// So whenever player finishes playing, it will automatically save the score under
// the name "anonymous139139" in database. It will then be displayed as "no name"
// on the webpage. Included here are some mechanics to identify those scores.
// Drawback is that no one is allowed to use the name "anonymous".
function getHighScore(req,res){
	jsonfile.readFile(HIGHSCOREFILE,function(err,obj){
		if (err){
			console.log('Error reading highscore file');
			res.status(500).json(err);
		} else {
			// if the weekly score is due reset, make it blank
			if (moment().valueOf() - obj.weeklyUpdated > 604800000){
				delete obj.weekly;
				obj.weeklyUpdated += 604800000;
			}
			// change the "anonoymous139139" to "anonymous"
			for (let i of obj.alltime){
				if (i.name == 'anonymous') i.name = 'xAnonymous';
				if (i.name == 'anonymous139139') i.name = 'anonymous';
			}
			// change the name for weekly scoreboard
			if (obj.weekly){
				for (let i of obj.weekly){
					if (i.name == 'anonymous') i.name = 'xAnonymous';
					if (i.name == 'anonymous139139') i.name = 'anonymous';
				}
			}
			// send the whole thing back
			res.status(200).json(obj);
		}
	});
}

// receive a score from the user and save it under the name "anonymous139139"
function postHighScore(req,res){
	jsonfile.readFile(HIGHSCOREFILE,function(err,obj){
		if (err){
			res.status(500).json(err);
		} else {
			// make a new object to be inserted
			var newScore = {
				"name": "anonymous139139",
				"score": parseInt(req.body.score),
				"time": parseInt(req.body.time),
				// internal: are we writing this into json or not
				"posting": true
			};
			// get vars from file
			var alltime = obj.alltime;
			var weekly = obj.weekly;
			var weeklyUpdated = obj.weeklyUpdated;
			// check if weekly is due reset, then reset it
			if (moment().valueOf() - weeklyUpdated > 604800000){
				weeklyUpdated += 604800000;
				weekly = [];
			};
			// check if the record has already been posted, if yes then disable posting
			for (let i of alltime){
				if (i.name == 'anonymous139139' && i.score == newScore.score && i.time == newScore.time){
					newScore.posting = false;
				}
			}
			for (let i of weekly){
				if (i.name == 'anonymous139139' && i.score == newScore.score && i.time == newScore.time){
					console.log('this score was here before');
					newScore.posting = false;
				}
			}
			// check if score is from before reset, if yes then disable posting
			if (weeklyUpdated > newScore.time)
				newScore.posting = false;
			// legit time or not?? time cannot come from the future!
			if (newScore.time - moment.valueOf() > 600000)
				newScore.posting = false;
			if (newScore.posting){
				// trim each scoreboard if it has more than maximum amount
				while (alltime.length > 20){
					var a = getLowest(alltime);
					alltime.splice(a,1);
				}
				while (weekly.length > 10){
					var a = getLowest(weekly);
					weekly.splice(a,1);
				}
				// get the lowest score of the scoreboard
				var minAlltime = getLowest(alltime);
				// if scoreboard is not full then just push
				if (alltime.length < 20){
					alltime.push(newScore);
				}
				// if scoreboard is full, compare with the lowest score then push
				else if (parseInt(newScore.score) > parseInt(alltime[minAlltime].score)){
					alltime.splice(minAlltime,1);
					alltime.push(newScore);
				}
				// do the same to weekly scoreboard
				// get the lowest score of the scoreboard
				var minWeekly = getLowest(weekly);
				// if scoreboard is not full then just push
				if (weekly.length < 10 && newScore.posting){
					weekly.push(newScore);
				}
				// if scoreboard is full, compare with the lowest score then push
				else if (parseInt(newScore.score) > parseInt(weekly[minWeekly].score)){
					weekly.splice(minWeekly,1);
					weekly.push(newScore);
				}
			}
			// new data to write back into json
			var newobj = {
				"alltime": alltime,
				"weeklyUpdated": weeklyUpdated,
				"weekly": weekly
			}
			jsonfile.writeFile(HIGHSCOREFILE,newobj, {spaces: 4}, function(err){
				if (err){
					res.status(500).json(err);
				} else {
					res.status(200).json(newobj);
				}
			})
		}
	});
}

// receive updated score from user (with name) and update the entry it in json file
function updateHighScore(req,res){
	jsonfile.readFile(HIGHSCOREFILE,function(err,obj){
		if (err){
			res.status(500).json(err);
		}
		else {
			// did anything changed or not?
			var changed = false;
			// extract from query
			var newScore = {
				"name": req.body.name,
				"score": req.body.score,
				"time": req.body.time
			};
			// extract from json file
			var alltime = obj.alltime;
			var weekly = obj.weekly;
			var weeklyUpdated = obj.weeklyUpdated;
			// look for the score and update it
			for (let i of alltime){
				if (i.name == "anonymous139139" && i.time == newScore.time && i.score == newScore.score){
					i.name = newScore.name;
					break;
				}
			}
			for (let i of weekly){
				if (i.name == "anonymous139139" && i.time == newScore.time && i.score == newScore.score){
					i.name = newScore.name;
					break;
				}
			}
			// write back to json file
			var newobj = {
				"alltime": alltime,
				"weeklyUpdated": weeklyUpdated,
				"weekly": weekly
			}
			jsonfile.writeFile(HIGHSCOREFILE,newobj, function(err){
				if (err){
					res.status(500).json(err);
				} else {
					res.status(200).json(newobj);
				}
			})
		}
	});
}

// Listen for requests
var server = app.listen(app.get('port'), function(){
	var port = server.address().port;
	console.log("Magic happens on port " + port);
});
