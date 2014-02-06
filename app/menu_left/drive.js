app.directive('drivePlayer', ["$rootScope", "cfpLoadingBar", "DataManager", "PlayerManager",
	function($rootScope, cfpLoadingBar, DataManager, PlayerManager) {
		return {
			restrict: 'E',
			templateUrl: 'menu_left/template/drive_player.tpl.html',
			link: function(scope) {
				var type = "slideshow";
				scope.datas = []
				DataManager.loadData(type, null, function(data) {
					angular.forEach(data.list, function(name, key) {
						scope.datas.push({
							title: name
						});
					});
					console.log(scope.datas);
				})
				$rootScope.$watch('playerSelected', function() {
					scope.selected = $rootScope.playerSelected;
				});
				scope.select = function(index) {
					$rootScope.playerSelected = index;

					DataManager.loadData(type, scope.datas[index].title, function(data) {
						PlayerManager.setData(data.n, data.path, scope.datas[index].title);
					})
				};
			}
		};
	}
]);
app.directive('driveQuiz', ["$rootScope", "cfpLoadingBar", "QuizManager", "LoginManager",
	function($rootScope, cfpLoadingBar, QuizManager, LoginManager) {
		return {
			restrict: 'E',
			templateUrl: 'menu_left/template/drive_quiz.tpl.html',
			link: function(scope) {
				LoginManager.getUser().then(function(user) {
					var name = user.username;
					QuizManager.list(name).then(function(data) {
						scope.datas = data;
					});
				});
				$rootScope.$watch('quizSelected', function() {
					scope.selected = $rootScope.quizSelected;
				});
				scope.select = function(index) {
					$rootScope.quizSelected = index;

					var id = scope.datas[index].node;
					QuizManager.node = id;
					scope.id = id;

					QuizManager.load().then(function(quizs) {
						console.log(quizs);
					});
				};
			}
		};
	}
]);
app.directive('driveSlide', ["$rootScope", "$q", "cfpLoadingBar", "GoogleService", "SlideManager", "PDFService",
	function($rootScope, $q, cfpLoadingBar, GoogleService, SlideManager, PDFService) {
		return {
			restrict: 'E',
			templateUrl: 'menu_left/template/drive_slide.tpl.html',
			link: function(scope) {
				cfpLoadingBar.start();
				GoogleService.load().then(function() {
					GoogleService.listFile().then(function(data) {
						if (angular.isArray(data)) {
							scope.datas = data;
						}
						cfpLoadingBar.complete();
					});
				});
				$rootScope.$watch('slideSelected', function() {
					scope.selected = $rootScope.slideSelected;
				});
				scope.select = function(index) {

					var id = scope.datas[index].id;
					SlideManager.setSlide(id);
					scope.id = id;
					$rootScope.slideSelected = id;

					var deferred = $q.defer();
					SlideManager.setMax(deferred);
					PDFService.getPdf(scope.id).then(function(pdf) {
						scope.pdf = pdf;
						deferred.resolve(pdf.pdfInfo.numPages);
					});
				};

				scope.toDate = function(date) {
					return new Date(date).toUTCString();
				}

			}
		};
	}
]);