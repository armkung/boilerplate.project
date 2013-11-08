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
		template: '<img class="fit-height" ng-repeat="emo in emotions" ng-src="{{url+emo}}" ng-click="select(index)">',
		scope: {
			emotion: '='
		},
		link: function(scope, iElement, iAttrs) {

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