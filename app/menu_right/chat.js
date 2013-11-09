app.directive('chat', function(DataManager) {
	return {
		restrict: 'E',
		templateUrl: 'menu_right/template/chat.tpl.html',
		link: function(scope) {
			var type = DataManager.types.MSG;
			var n = 9;

			scope.url = "assets/emoticon/";
			scope.msgs = [];
			scope.emotions = [];

			for (var i = 1; i <= n; i++) {
				scope.emotions.push(i + ".gif");
			}

			DataManager.getData(type, function(data) {
				scope.msgs.push(data);
			});

			scope.select = function(index) {
				var emotion = scope.url + scope.emotions[index];
				DataManager.setData(type, {
					msg: emotion
				});
			};
		}
	};
});