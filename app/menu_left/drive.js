app.directive('driveQuiz', function() {
	return {
		restrict: 'E',
		templateUrl: 'menu_left/template/drive_quiz.tpl.html',
		controller: function($scope) {
			$scope.datas = ["a", "b"];
			$scope.select = function(index) {
				var id = $scope.datas[index];
				console.log(id);
			};
		}
	};
});
app.directive('driveSlide', function($rootScope, $q, cfpLoadingBar, GoogleService, SlideManager, Canvas, DrawManager, PDFService) {
	return {
		restrict: 'E',
		templateUrl: 'menu_left/template/drive_slide.tpl.html',
		controller: function($scope) {
			cfpLoadingBar.start();
			GoogleService.load().then(function() {
				GoogleService.listFile().then(function(data) {
					console.log(data);
					$scope.datas = data;

					cfpLoadingBar.complete();
				});
			});
			$rootScope.$watch('slideSelected', function() {
				$scope.selected = $rootScope.slideSelected;
			});
			$scope.select = function(index) {
				$rootScope.slideSelected = index;

				var id = $scope.datas[index].id;
				SlideManager.setSlide(id);
				$scope.id = id;

				var deferred = $q.defer();
				SlideManager.setMax(deferred);
				$scope.getPdf($scope.id).then(function(pdf) {
					deferred.resolve(pdf.pdfInfo.numPages);
				});
			};
			$scope.getPdf = function(id) {
				var deferred = $q.defer();
				GoogleService.getFile(id).then(function(data) {
					var url = data.exportLinks['application/pdf'];
					PDFService.load(url).then(function(pdf) {
						$scope.pdf = pdf;
						deferred.resolve(pdf);
					});
				});
				return deferred.promise;
			};
			$scope.share = function() {
				GoogleService.shareFile(id).then(function(data) {
					console.log(data);
				});
			};

			function loadCanvas(name) {
				var id = "data";
				var cs = Canvas.newCanvas(id, Canvas.width, Canvas.height);
				DrawManager.getObject(cs, name);
				return cs;
			}
			$scope.saveDraw = function() {
				var type = "image/png";
				var name = "test";

				var cs = loadCanvas(Canvas.types.DRAW);
				var data = cs.toDataURL({
					format: type.split("/")
				});

				var obj = {};
				obj.type = type;
				obj.data = data.split(",")[1];
				obj.fileName = name;
				GoogleService.insertFile(obj);

			};

			$scope.saveSlide = function() {
				cfpLoadingBar.start();
				var name = "test";
				// Canvas.getCanvas().then(function() {

				var id = SlideManager.slide;
				if (id) {
					$scope.getPdf(id).then(function(pdf) {

						var n = pdf.pdfInfo.numPages;
						var mirrors = [];
						for (var i = 1; i <= n; i++) {
							var cs = loadCanvas(Canvas.types.MIRROR + "-" + i);
							mirrors.push(cs);
						}

						PDFService.init(mirrors);
						PDFService.render(pdf, n).then(function(data) {
							console.log(data);
							var obj = {};
							obj.type = "application/pdf";
							obj.data = data.split(",")[1];
							obj.fileName = name;
							GoogleService.insertFile(obj).then(function(data) {
								cfpLoadingBar.complete();
							});
						});

					});
				}
				// });
			};
		}
	};
});