app.service('GroupManager', function($rootScope, Canvas, Room) {
	var self = this;
	var layer;
	var children;

	function getGroupById(id) {
		return layer.get('#' + id)[0];
	}
	// this.groups = [];
	this.init = function(stage) {
		layer = stage.get('Layer')[0];
		children = layer.getChildren();
		// self.groups = [];
		// angular.forEach(children, function(group, key) {
		// 	if (group.getId() != '') {
		// 		self.groups.push({
		// 			id: group.getId()
		// 		});
		// 	}
		// });
		self.hideAll();
	}
	this.getGroups = function(users) {
		var groups = [];
		angular.forEach(children, function(child, key) {
			var id = child.getId();
			var group = getGroupById(id);
			if (users.indexOf(id) != -1) {
				groups.push({
					id: id
				});
			} else {
				if (id != '') {
					group.remove();
					layer.draw();
				}
			}
		});
		return groups;
	}
	this.hideAll = function() {
		angular.forEach(children, function(group, key) {			
			if (group.getId() != '') {
				group.hide();
				layer.draw();
			}
		});
	}
	this.show = function(id) {
		var group = getGroupById(id);
		group.show();
		layer.draw();
	}
	this.hide = function(id) {
		var group = getGroupById(id);
		group.hide();
		layer.draw();
	}

});