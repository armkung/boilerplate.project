app.directive('driveQuiz', function() {
	return {
		restrict: 'E',
		templateUrl: 'menu_left/template/drive_quiz.tpl.html',
		link: function(scope) {
			scope.datas = ["a", "b"];
			scope.select = function(index) {
				var id = scope.datas[index];
				console.log(id);
			};
		}
	};
});
app.directive('driveSlide', ["$rootScope", "$q", "cfpLoadingBar", "GoogleService", "SlideManager", "PDFService",
	function($rootScope, $q, cfpLoadingBar, GoogleService, SlideManager, PDFService) {
		return {
			restrict: 'E',
			templateUrl: 'menu_left/template/drive_slide.tpl.html',
			link: function(scope) {
				cfpLoadingBar.start();
				GoogleService.load().then(function() {
					GoogleService.listFile().then(function(data) {
						console.log(data);
						scope.datas = data;

						cfpLoadingBar.complete();
					});
				});
				$rootScope.$watch('slideSelected', function() {
					scope.selected = $rootScope.slideSelected;
				});
				scope.select = function(index) {
					$rootScope.slideSelected = index;

					var id = scope.datas[index].id;
					SlideManager.setSlide(id);
					scope.id = id;

					var deferred = $q.defer();
					SlideManager.setMax(deferred);
					PDFService.getPdf(scope.id).then(function(pdf) {
						scope.pdf = pdf;
						deferred.resolve(pdf.pdfInfo.numPages);
					});
				};

				scope.share = function() {
					GoogleService.shareFile(id).then(function(data) {
						console.log(data);
					});
				};

				scope.toDate = function(date) {
					return new Date(date).toUTCString();
				}

			}
		};
	}
]);