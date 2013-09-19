app.directive('group', function(GroupManager, Room, Canvas) {
	return {
		restrict: 'E',
		templateUrl: 'menu_right/group.tpl.html',
		link: function(scope) {
			scope.room = Room;
			scope.$watch('room.users', function() {
				Canvas.getCanvas().then(function(canvas) {
					GroupManager.init(canvas);
					scope.groups = GroupManager.getGroups(Room.users);
				});
			}, true);

			var isHide = true;
			scope.toggle = function(index) {
				if (isHide) {
					GroupManager.show(scope.groups[index].id);
				} else {
					GroupManager.hide(scope.groups[index].id);
				}
				isHide = !isHide;
			}
		}
	};
});