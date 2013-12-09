app.directive('chat', ["DataManager", "$http",
	function(DataManager, $http) {
		return {
			restrict: 'E',
			templateUrl: 'menu_right/template/chat.tpl.html',
			link: function(scope) {
				var type = DataManager.types.MSG;

				scope.url = "assets/emoticon/";
				scope.msgs = [];
				scope.emotions = [];

				$http.get(scope.url + 'index.json').then(function(data) {
					angular.forEach(data.data.index, function(name, key) {
						scope.emotions.push(name);
					});
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
						scope.msgs.push(emotion);

						DataManager.setData(type, {
							msg: emotion
						});
					};
				});

			}
		};
	}
]);