app.directive('slidePad', ["$q", "$sce", "$state", "cfpLoadingBar", "DrawManager", "SlideManager", "DataManager", "PDFService",
	function($q, $sce, $state, cfpLoadingBar, DrawManager, SlideManager, DataManager, PDFService) {
		return {
			restrict: 'E',
			template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
			scope: {
				send: '=',
				load: '='
			},
			link: function(scope, iElement, iAttr) {
				var id = "mirror";
				var type = DataManager.types.SLIDE;
				// var deferred = $q.defer();
				// cfpLoadingBar.start();
				scope.load = true;
				var iframe = $('#slide');
				iframe.height(iframe.height() + 28);
				iframe.bind('load', function() {
					// cfpLoadingBar.complete();
				});

				scope.isInit = false;
				scope.slide = SlideManager;
				DataManager.getData(type, function(data) {
					if (data) {
						SlideManager.setSlide(data.slide, data.index);
						// changeSlide();
						if (data.max) {
							SlideManager.max = data.max;
						}
					} else {
						// if (angular.isUndefined(SlideManager.slide)) {
						// 	$state.go('main.drive');
						// }
					}
				});

				if (angular.isDefined(SlideManager.slide)) {
					scope.isInit = true;
					changeSlide();
					initSlide();
					var unbind = scope.$watch(scope.send, function() {
						if (scope.send) {
							DataManager.setData(type, {
								slide: SlideManager.slide,
								index: 0,
							});
						}
						unbind();
					})
				}
				DataManager.initData(type);
				initCanvas(SlideManager.index);

				scope.$watch('slide.index', function(newV, oldV) {
					if (newV != oldV) {
						if (angular.isDefined(SlideManager.slide) && angular.isDefined(SlideManager.index)) {
							if (scope.send) {
								DataManager.setData(type, {
									slide: SlideManager.slide,
									index: SlideManager.index,
									max: SlideManager.max
								});
							}
							changeSlide();
							if (!scope.isInit) {
								scope.$emit('load_slide', SlideManager.slide);
								initSlide(function() {
									initCanvas(newV, oldV);
								});
							} else {
								initCanvas(newV, oldV);
							}

						}
					}
				});


				function changeSlide() {
					var url = SlideManager.getUrl();
					if (url) {
						scope.url = $sce.trustAsResourceUrl(url);
					}
				}

				function initSlide(callback) {
					scope.isInit = true;
					SlideManager.getMax().then(function(pdf, max) {
						SlideManager.max = max;
						var scale = DrawManager.getScale();
						cfpLoadingBar.start();
						PDFService.getScale(pdf, scale.x, scale.y).then(function(scale) {
							DrawManager.setSize(scale.x, scale.y)
							cfpLoadingBar.complete();
							scope.load = false;
							if (callback) {
								callback();
							}
						});
					});
				}

				function initCanvas(newV, oldV) {
					var name = id + "-";
					DataManager.initData(DataManager.types.POS, name + newV);
					if (oldV) {
						DrawManager.saveData(name + oldV);
					}
					if (newV) {
						DrawManager.newObject(name + newV);
					}
				}
			}
		}
	}
]);