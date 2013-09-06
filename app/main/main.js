app.directive('chat', function() {
	return {
		restrict: 'E',
		templateUrl: 'main/chat.tpl.html',
		controller: 'ChatCtrl'
	};
});
app.directive('emoticon', function() {
	return {
		restrict: 'E',
		templateUrl: 'emoticon.tpl.html',
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

app.directive('menu', function() {
	return {
		restrict: 'E',
		templateUrl: 'main/menu.tpl.html'
	};
});

app.directive('fitSize', function() {
	return {
		restrict: 'AC',
		link: function(scope,iElement){
			console.log($(iElement).height()+" "+$('#pad').height());
			$(iElement).width($('#pad').width());
			$(iElement).height($('#pad').height());
		}
	};
});