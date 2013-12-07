app.directive('group', ["GroupManager", "Room", "$rootScope",
	function(GroupManager, Room, $rootScope) {
		return {
			restrict: 'E',
			templateUrl: 'menu_right/template/group.tpl.html',
			link: function(scope) {
				scope.room = Room;
				$rootScope.$on('group', function() {
				// scope.groups = DrawManager.getGroup();
				// scope.$watch('groups', function() {
					scope.groups = GroupManager.getGroups(Room.users, Room.user);
				// })
				});

				scope.toggle = function(id) {
					scope.groups[id].isHide = !scope.groups[id].isHide;
					if (scope.groups[id].isHide) {
						GroupManager.hide(id);
					} else {
						GroupManager.show(id);
					}
				};
			}
		};
	}
]);