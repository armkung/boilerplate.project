app.directive('group', ["GroupManager", "Room", "Canvas",
	function(GroupManager, Room, Canvas) {
		return {
			restrict: 'E',
			templateUrl: 'menu_right/template/group.tpl.html',
			link: function(scope) {
				scope.room = Room;

				scope.$watch('room.users', function() {
					scope.groups = GroupManager.getGroups(Room.users);
				}, true);

				scope.toggle = function(index) {
					scope.groups[index].isHide = !scope.groups[index].isHide;
					if (scope.groups[index].isHide) {
						GroupManager.hide(index);
					} else {
						GroupManager.show(index);
					}
				};
			}
		};
	}
]);