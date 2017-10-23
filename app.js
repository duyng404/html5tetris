var jsonfile = require('jsonfile');
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var app = express();

const HIGHSCOREFILE = './highscore.json'

app.set('port', 8080);

app.use(function(req, res, next){
	console.log(req.method, req.url);
	next();
});

// static directory
app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: false }));;
app.use(bodyParser.json());
//app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')));

app.
	route('/z/getHighScore').
	get(getHighScore);

app.
	route('/z/postHighScore').
	post(authenticate, postHighScore);

function getLowest(scoreboard){
	min = 0;
	for (var i=1; i<scoreboard.length; i++){
		if (scoreboard[i].score < scoreboard[min].score)
			min=i;
	}
	return min;
}

function getHighScore(req,res){
	jsonfile.readFile(HIGHSCOREFILE,function(err,obj){
		if (err){
			console.log('Error reading highscore file');
			res.status(500).json(err);
		} else {
			var token = jwt.sign({ 'game':'t3tri5' }, 's3cr3t', { expiresIn: 3600 });
			obj.alltime.sort(function(a,b){
				return b.score - a.score;
			});
			obj.weekly.sort(function(a,b){
				return b.score - a.score;
			});
			obj.token = token;
			res.status(200).json(obj);
		}
	});
}

function postHighScore(req,res){
	jsonfile.readFile(HIGHSCOREFILE,function(err,obj){
		if (err){
			res.status(500).json(err);
		}
		else {
			var newScore = {
				"name": req.body.name,
				"score": req.body.score,
				"time": req.body.time
			};
			var alltime = obj.alltime;
			var weekly = obj.weekly;
			// make sure it has 10 items
			while (alltime.length > 20){
				var a = getLowest(alltime);
				alltime.splice(a,1);
			}
			while (weekly.length > 10){
				var a = getLowest(weekly);
				weekly.splice(a,1);
			}
			if (alltime.length < 20){
				// get the lowest score
				var minAlltime = getLowest(alltime);
				// compare score
				// if score is more, pop the lowest score, push the score
				if (req.body.score > alltime[minAlltime].score){
					alltime.splice(minAlltime,1);
					alltime.push(newScore);
				}
			}
			if (weekly.length < 10){
				// get the lowest score
				var minWeekly = getLowest(weekly);
				// compare score
				// if score is more, pop the lowest score, push the score
				if (req.body.score > weekly[minWeekly].score){
					weekly.splice(minWeekly,1);
					weekly.push(newScore);
				}
			}
			console.log(alltime.length,weekly.length);
			var weeklyUpdated = obj.weeklyUpdated;
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

function authenticate(req,res,next){
	var headerExists = req.headers.authorization;
	if (headerExists){
		var token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, 's3cr3t', function(err,decoded){
			if (err){
				console.log(error);
				res.status(401).json('Unauthorized');
			} else {
				req.game = decoded.game;
				next();
			}
		});
	} else {
		res.status(403).json('No token provided');
	}
}

// Listen for requests
var server = app.listen(app.get('port'), function(){
	var port = server.address().port;
	console.log("Magic happens on port " + port);
});
