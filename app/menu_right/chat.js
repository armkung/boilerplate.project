app.directive('chat', ["DataManager", "$http", "LoginManager", "$rootScope",
	function(DataManager, $http, LoginManager, $rootScope) {
		return {
			restrict: 'E',
			templateUrl: 'menu_right/template/chat.tpl.html',
			link: function(scope) {
				var type = DataManager.types.MSG;

				scope.url = "assets/emoticon/";
				$rootScope.msgs = [];
				scope.emotions = [];

				$http.get(scope.url + 'index.json').then(function(data) {
					angular.forEach(data.data.index, function(name, key) {
						scope.emotions.push(name);
					});
					DataManager.getData(type, function(data) {
						if (angular.isArray(data)) {
							angular.forEach(data, function(msg, key) {
								$rootScope.msgs.push(msg.emotion);
							});
						} else {
							$rootScope.msgs.push(data);
						}
					});

					DataManager.initData(type);
					scope.select = function(index) {
						var emotion = scope.url + scope.emotions[index];
						$rootScope.msgs.push(emotion);
						// LoginManager.getUser().then(function(user) {
						DataManager.setData(type, {
							msg: emotion
							// user: user.username
						});
						// });
					};
				});

			}
		};
	}
]);