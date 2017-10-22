var jsonfile = require('jsonfile');
var express = require('express');
var bodyParser = require('body-parser');
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
	post(postHighScore);

function getHighScore(req,res){
	jsonfile.readFile(HIGHSCOREFILE,function(err,obj){
		if (err){
			res.status(500).json(err);
		} else {
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
			var alltime = obj.alltime;
			var weekly = obj.weekly;
			var weeklyUpdated = obj.weeklyUpdated;
			alltime.push({
				"name": req.body.name,
				"score": req.body.score,
				"time": req.body.time
			});
			weekly.push({
				"name": req.body.name,
				"score": req.body.score,
				"time": req.body.time
			});
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
