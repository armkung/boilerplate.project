app.directive('toolBar', ["$rootScope", "DrawFactory",
	function($rootScope, DrawFactory) {
		return {
			restrict: 'E',
			templateUrl: 'menu_left/template/tool_bar.tpl.html',
			scope: {
				tool: '=',
				isHide: '@'
			},
			link: function(scope, iElement, iAttrs) {
				var tools = DrawFactory.tools;
				scope.toolLeft = [tools.MODE, tools.DRAG_OBJECT, tools.DRAG_GROUP, tools.CLEAR];
				scope.toolRight = [tools.DRAW, tools.LINE, tools.TEXT, tools.DELETE];

				scope.changeToolLeft = function(index) {
					scope.tool = scope.toolLeft[index];
					sendTool();
				};
				scope.changeToolRight = function(index) {
					scope.tool = scope.toolRight[index];
					sendTool();
				};

				function sendTool() {
					$rootScope.$broadcast('tool', scope.tool);
				}
				// scope.changeAttr = function(index) {
				// 	$rootScope.$broadcast('attr', scope.attrs[index]);
				// };

				scope.changeToolLeft(0);
			}
		};
	}
]);

app.directive('selector', ["$rootScope", "$modal", "DrawFactory",
	function($rootScope, $modal, DrawFactory) {
		return {
			restrict: 'E',
			template: '<div class="width-100 fit-height" ng-click="dialog()"><div id="attr">' +
				'<div id="color" class="pull-left"></div>' +
				'<div class="pull-left white margin-10">' +
				'<i id ="size" class="icon-circle align-middle"></i>' +
				'<span class="bigger-140 align-middle">{{selector.size}}<span>' +
				'</div></div></div>',
			link: function(scope, iElement, iAttrs) {
				if (angular.isUndefined($rootScope.selector)) {
					$rootScope.selector = {
						alpha: 100,
						size: 5,
						color: '#000000'
					};
				}
				scope.attr = 'rgb(0,0,0)';
				scope.selector = $rootScope.selector;

				var eColor = $('#color');
				var size = iElement.height();
				var border = eColor.outerWidth() - eColor.width();
				eColor.width(size - border);
				eColor.height(size - border);
				scope.$watch('selector.color', function() {
					eColor.css('background-color', scope.selector.color);
				})

				var eSize = $('#size');
				scope.$watch('selector.size', function() {
					var scale = (scope.selector.size / 50.0) * 100;
					eSize.css('font-size', (100 + scale) + "%");
				})

				var eAttr = $('#attr');
				eAttr.css('margin-left', (eAttr.width() - size) / 2 + "px");

				var attrs = DrawFactory.attrs;
				scope.dialog = function() {
					var modal = $modal.open({
						backdrop: false,
						resolve: {
							selector: function() {
								return $rootScope.selector;
							}
						},
						templateUrl: 'menu_left/template/attribute.tpl.html',
						controller: ["$scope", "$modalInstance", "selector",
							function($scope, $modalInstance, selector) {
								function changeAlpha(opacity) {
									var hex = selector.color.replace('#', '');
									r = parseInt(hex.substring(0, 2), 16);
									g = parseInt(hex.substring(2, 4), 16);
									b = parseInt(hex.substring(4, 6), 16);

									result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
									return result;
								}
								$scope.selector = selector;

								var attrs = DrawFactory.attrs;
								$scope.$watch('selector.size', function() {
									$rootScope.$broadcast('attr', {
										attr: attrs.SIZE,
										data: selector.size
									});
								})
								$scope.$watch('selector.alpha', function() {
									$rootScope.$broadcast('attr', {
										attr: attrs.COLOR,
										data: changeAlpha(selector.alpha)
									});
								})
								$scope.$watch('selector.color', function() {
									$rootScope.$broadcast('attr', {
										attr: attrs.COLOR,
										data: changeAlpha(selector.alpha)
									});
								});
								$scope.close = function() {
									$modalInstance.close(selector);
								};
							}
						]
					});
					modal.result.then(function(selector) {
						$rootScope.selector = selector;
					});
				}

			}
		};
	}
]);
app.directive('slider', function() {
	return {
		restrict: 'AC',
		scope: {
			size: '='
		},
		link: function(scope, iElement, iAttrs) {
			iElement.slider({
				value: scope.size,
				range: "min",
				min: 1,
				max: iAttrs.max,
				step: 1,
				slide: function(event, ui) {
					scope.size = ui.value;
					scope.$apply();
				}
			});
		}
	}
});
app.directive('picker', ["$rootScope",
	function($rootScope) {
		return {
			restrict: 'E',
			template: '<div class="picker inline" ng-click="select($index)" ng-class="{pick:selected==$index}" ng-repeat="c in colors" style="background-color:{{c}}"><div>',
			scope: {
				color: '='
			},
			link: function(scope, iElement, iAttrs) {
				scope.selected = $rootScope.colorSelected || 0;
				scope.colors = ['#000000', '#555',
					'#ac725e', '#d06b64', '#f83a22', '#fa573c', '#ff7537',
					'#ffad46', '#42d692', '#16a765', '#7bd148', '#b3dc6c',
					'#fbe983', '#fad165', '#92e1c0', '#9fe1e7', '#9fc6e7',
					'#4986e7', '#9a9cff', '#b99aff', '#c2c2c2', '#cabdbf',
					'#cca6ac', '#f691b2', '#cd74e6', '#a47ae2', '#ffffff'
				];
				scope.select = function(index) {
					$rootScope.colorSelected = index;
					scope.selected = $rootScope.colorSelected;
					scope.color = scope.colors[index];
				}
			}
		}
	}
]);