app.directive('group', function(GroupManager, Room, Canvas) {
	return {
		restrict: 'E',
		templateUrl: 'menu_right/group.tpl.html',
		link: function(scope) {
			scope.room = Room;
			scope.$watch('room.users', function() {
				scope.groups = GroupManager.getGroups(Room.users);
			}, true);

			scope.toggle = function(index) {
				scope.groups.isHide = !scope.groups.isHide;
				if (scope.groups.isHide) {
					GroupManager.hide(index);
				} else {
					GroupManager.show(index);
				}
			}
		}
	};
});