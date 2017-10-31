angular.
	module('highscorepage', ['ngRoute', 'angular-jwt']).
	controller('EndGameController',EndGameController).
	config(config);

// basic config
function config($httpProvider, $routeProvider, $locationProvider) {
	// the only route we need is this
	$routeProvider
		.when('/highscore.html', {
			templateUrl: './highscoreResources/template.html',
			controller: EndGameController,
			controllerAs: 'vm',
			access: { restricted: false	}
		})
		.otherwise({
			redirectTo: '/'
		});

	// enable html5mode
	$locationProvider.html5Mode(true);
}

// the one and only controller we need
function EndGameController($route,$window,$http){
	var vm = this;
	// get the info from localStorage
	vm.score = $window.localStorage.score;
	vm.time = $window.localStorage.time;
	// did the user still have unsaved score?
	vm.hasScore = false;
	// can the user save score?
	vm.canSave = false;
	if (vm.score && vm.time) vm.hasScore = true;
	// if there is any error stored in sessionStorage
	if ($window.sessionStorage.error) {
		vm.error = $window.sessionStorage.error;
		$window.sessionStorage.clear();
	}

	// if user has unsaved score, then attempt to POST it
	if (vm.hasScore){
	// prepare the data to POST
		var postData = {
			score: vm.score,
			time: vm.time
		};
		// perform the POST
		$http.post('/z/postHighScore',postData).then(function(postRes){
			if (postRes.status === 200){
				// if POST successful, then GET the new scores
				getScore()
			} else {
				// if status is not 200
				$window.sessionStorage.error = "There were some errors when posting your score. Please try again later.";
			}
		}).catch(function(error){
			console.log(error);
			$window.sessionStorage.error = "There were some errors when posting your score. Please try again later. Here are the details: " + error;
		})
	}
	// if user doesn't have unsaved score, just GET the scores
	else {
		getScore();
	}

	// this function perform the GET and retrieve the data
	function getScore(){
		$http.get('/z/getHighScore').then(function(res){
			vm.alltime = res.data.alltime;
			// turn anyone score under the name "anonymous" to "no name"
			for (let i of vm.alltime){
				if (i.name == 'anonymous') i.name = 'no name';
				// also display the time correctly
				if (moment().valueOf() - i.time < 172800000)
					i.time = moment(parseInt(i.time)).fromNow();
				else i.time = moment(parseInt(i.time)).format('MMM D');
			}
			// sort the alltime scores from highest to lowest
			vm.alltime.sort(function(a,b){
				return b.score - a.score;
			});
			// do the same to weekly scoreboard
			vm.weekly = res.data.weekly;
			if (vm.weekly){
				for (let i of vm.weekly){
					if (i.name == 'anonymous') i.name = 'no name';
					if (moment().valueOf() - i.time < 172800000)
						i.time = moment(parseInt(i.time)).fromNow();
					else i.time = moment(parseInt(i.time)).format('MMM D');
				}
				// sort the weekly score from highest to lowest
				vm.weekly.sort(function(a,b){
					return b.score - a.score;
				});
			}
			// calculate the next Update
			vm.nextUpdate = moment(parseInt(res.data.weeklyUpdated)+604800000).fromNow();
			// can the user save score?
			if (vm.hasScore && (vm.alltime.length<20 || parseInt(vm.alltime[vm.alltime.length-1].score) <= parseInt(vm.score) || vm.weekly.length<10 || parseInt(vm.weekly[vm.weekly.length-1].score) <= parseInt(vm.score))){
				console.log(vm.weekly[vm.weekly.length-1].score < vm.score,vm.weekly[vm.weekly.length-1].score);
				vm.canSave = true;
			}
		}).catch(function(err){
			$window.sessionStorage.error = "There were some errors while trying to retrieve highscore from the server. Please try again later. Here are some details: " + err;
		});
	}

	// this function simply clear the saved score and go back to the game
	vm.playAgain = function(){
		$window.localStorage.clear();
		$window.location.href='/';
	}

	// this function will POST the score with the new name
	vm.addScore = function(){
		var postData = {
			name: vm.nameField,
			score: vm.score,
			time: vm.time
		};
		if (vm.nameInputForm.$valid){
			$http.post('/z/updateHighScore',postData).then(function(res){
				if (res.status === 200){
					$window.localStorage.clear();
					$route.reload();
				} else {
					$window.sessionStorage.error = "There were some errors when posting your score. Please try again later."
					$route.reload();
				}
			}).catch(function(error){
				console.log(error);
				$window.sessionStorage.error = "There were some errors when posting your score. Please try again later. Here are the details: " + error;
			});
		}
	}
}
