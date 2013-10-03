app.directive('chat', function() {
	return {
		restrict: 'E',
		templateUrl: 'menu_right/template/chat.tpl.html',
		controller: 'ChatCtrl'
	};
});
app.directive('emoticon', function() {
	return {
		restrict: 'E',
		templateUrl: 'menu_right/template/emoticon.tpl.html',
		scope: {
			emotion: '='
		},
		controller: function($scope) {
			$scope.url = "assets/emoticon/";
			$scope.emotions = [];
			for (var i = 1; i <= 9; i++) {
				$scope.emotions.push(i + ".gif");
			}
			$scope.select = function(index) {
				$scope.emotion = $scope.url + $scope.emotions[index];
			};
		}
	};
});