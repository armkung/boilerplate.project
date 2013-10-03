app.directive('menuLeft', function() {
	return {
		restrict: 'E',
		templateUrl: 'main/template/menu_left.tpl.html'
	};
});

app.directive('menuRight', function() {
	return {
		restrict: 'E',
		templateUrl: 'main/template/menu_right.tpl.html',
		controller: 'MenuRightCtrl'
	};
});

app.directive('fitSize', function() {
	return {
		restrict: 'AC',
		link: function(scope, iElement) {
			$(iElement).width($('#pad').width());
			$(iElement).height($('#pad').height());
		}
	};
});