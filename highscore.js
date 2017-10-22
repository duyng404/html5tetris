angular.
	module('highscorepage', ['ngRoute', 'angular-jwt']).
	config(config).
	factory('AuthInterceptor',AuthInterceptor).
	factory('AuthFactory',AuthFactory).
	run(run).
	controller('EndGameController',EndGameController);

// I don't know what these do but best to leave it there
function AuthFactory() {
	return{
		auth: auth
	}
	var auth = {
		isLoggedIn: false
	};
}

function AuthInterceptor($location, $q, $window, AuthFactory) {
	return {
		request: request,
		response: response,
		responseError: responseError
	};

	function request(config) {
		config.headers = config.headers || {};
		if ($window.sessionStorage.token) {
			config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
		}
		return config;
	}

	function response(response) {
		if (response.status === 200 && $window.sessionStorage.token && !AuthFactory.isLoggedIn) {
			AuthFactory.isLoggedIn = true;
		}
		if (response.status === 401) {
			AuthFactory.isLoggedIn = false;
		}
		return response || $q.when(response);
	}

	function responseError(rejection) {
		if (rejection.status === 401 || rejection.status === 403) {
			delete $window.sessionStorage.token;
			AuthFactory.isLoggedIn = false;
			$location.path('/');
		}
		return $q.reject(rejection);
	}
}

function run($rootScope, $location, $window, AuthFactory) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		if (nextRoute.access !== undefined && nextRoute.access.restricted && !$window.sessionStorage.token && !AuthFactory.isLoggedIn) {
			event.preventDefault();
			$location.path('/');
		}
	});
}

function config($httpProvider, $routeProvider, $locationProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');

	$routeProvider
		.when('/highscore.html', {
			templateUrl: './endgame.html',
			controller: EndGameController,
			controllerAs: 'vm',
			access: { restricted: false	}
		})
		.when('/postScore', {
			templateUrl: 'angular-app/hotel-list/hotels.html',
			//controller: HotelsController,
			//controllerAs: 'vm',
			access: { restricted: false	}
		})
		.otherwise({
			redirectTo: '/'
		});

	$locationProvider.html5Mode(true);
}

function EndGameController($route,$window,$http){
	var vm = this;
	vm.score = $window.localStorage.score;
	vm.time = $window.localStorage.time;

	$http.get('/z/getHighScore').then(function(res){
		console.log(res.data);
		vm.alltime = res.data.alltime;
		vm.weekly = res.data.weekly;
	});

	vm.addScore = function(){
		var postData = {
			name: vm.nameField,
			score: vm.score,
			time: vm.time
		};
		if (vm.nameInputForm.$valid){
			$http.post('/z/postHighScore',postData).then(function(res){
				if (res.status === 200)
					$route.reload();
			}).catch(function(error){
				console.log(error);
			});
		}
	}
}



//window.onload = function(){
//	var time = localStorage.getItem('time');
//	console.log("hello",score,time);
//	document.getElementById('score').innerHTML = 'Your score is: ' + score;
//	document.getElementById('time').innerHTML = 'The time was posted: ' + time;
//
//	var obj = {name: 'JP'};
//	jsonfile.writefile(file,obj,function(err){
//		console.error(err);
//	});
//}
