app.directive('toolBar', function($rootScope, DrawFactory) {
	return {
		restrict: 'E',
		templateUrl: 'menu_left/template/tool_bar.tpl.html',
		scope: {
			tool: '=',
			isHide: '@'
		},
		link: function(scope, iElement, iAttrs) {
			var tools = DrawFactory.tools;
			scope.toolLeft = [tools.MODE, tools.DRAG_OBJECT, tools.DRAG_GROUP];
			scope.toolRight = [tools.DRAW, tools.LINE, tools.TEXT, tools.CLEAR, tools.DELETE];

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
});

app.directive('selector', function($rootScope, DrawFactory) {
	return {
		restrict: 'E',
		templateUrl: 'menu_left/template/attribute.tpl.html',
		link: function(scope, iElement, iAttrs) {
			var element = $('.color');
			scope.attr = 'rgb(0,0,0)';
			var size = iElement.height();
			element.width(size);
			element.height(size);

			var attrs = DrawFactory.attrs;
			scope.$watch('attr', function() {
				element.css('background-color', scope.attr);

				$rootScope.$broadcast('attr', {
					attr: attrs.COLOR,
					data: scope.attr
				});
			})

		}
	};
});