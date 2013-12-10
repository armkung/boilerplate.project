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