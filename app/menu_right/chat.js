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
		template: '<img width="{{size}}" height="{{size}}" ng-repeat="emo in emotions" ng-src="{{url+emo}}" ng-click="select(index)" class="emoticon">',
		scope: {
			emotion: '='
		},
		link: function(scope, iElement, iAttrs) {
			scope.size = iElement.parent().height() - 15;

			scope.url = "assets/emoticon/";
			scope.emotions = [];
			for (var i = 1; i <= 9; i++) {
				scope.emotions.push(i + ".gif");
			}
			scope.select = function(index) {
				scope.emotion = scope.url + scope.emotions[index];
			};
		}
	};
});