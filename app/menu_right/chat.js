app.directive('chat', ["DataManager",
	function(DataManager) {
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
					if (angular.isArray(data)) {
						angular.forEach(data, function(msg, key) {
							scope.msgs.push(msg);
						});
					} else {
						scope.msgs.push(data);
					}
				});

				DataManager.initData(type);
				scope.select = function(index) {
					var emotion = scope.url + scope.emotions[index];
					DataManager.setData(type, {
						msg: emotion
					});
				};
			}
		};
	}
]);