app.directive('menuLeft', function() {
	return {
		restrict: 'E',
		templateUrl: 'main/template/menu_left.tpl.html',
		controller: 'MenuLeftCtrl'
	};
});

app.directive('scrollBar', function() {
	return {
		restrict: 'AC',
		link: function(scope, iElement, iAttrs) {
			iElement.perfectScrollbar({
				// useBothWheelAxes: true
			});

			// iElement.scrollTop(100);
			// iElement.perfectScrollbar('update');
		}
	};
});

app.directive('isVisible', function() {
	return {
		restrict: 'AC',
		scope: {
			isVisible: '='
		},
		link: function(scope, iElement, iAttrs) {
			var display = iElement.css('display');
			scope.isVisible = display != 'none';
		}
	};
});

app.directive('fitSize', function() {
	return {
		restrict: 'AC',
		link: function(scope, iElement, iAttrs) {
			$(iElement).width(iElement.parent().width());
			$(iElement).height(iElement.parent().height());
		}
	};
});