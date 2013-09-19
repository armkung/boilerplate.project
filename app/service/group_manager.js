app.service('GroupManager', function($rootScope, Canvas, Room) {
	var self = this;
	var canvas;
	var objs;

	this.init = function(cs) {
		canvas = cs;
		objs = canvas.getObjects();
		// angular.forEach(canvas.getObjects(), function(obj, key) {
		// 	if (obj instanceof fabric.Group) {
		// 		objs.push(obj);
		// 	}
		// });
		self.hideAll();
	}
	this.getGroups = function(users) {
		var groups = [];
		var tmp = users.slice(0);
		angular.forEach(objs, function(obj, key) {
			if (obj instanceof fabric.Group) {
				var user = tmp.shift();
				if (!(user in groups)) {
					groups.push({
						user: user,
						id: key
					});
				}
			}
		});
		angular.forEach(groups, function(group, user) {
			if (!(user in users)) {
				canvas.item(group.id).remove();
			};
		});
		canvas.renderAll();
		// angular.forEach(children, function(child, key) {
		// 	var id = child.getId();
		// 	var group = getGroupById(id);
		// 	if (users.indexOf(id) != -1) {
		// 		groups.push({
		// 			id: id
		// 		});
		// 	} else {
		// 		if (id != '') {
		// 			group.remove();
		// 			layer.draw();
		// 		}
		// 	}
		// });
		return groups;
	}
	this.hideAll = function() {
		angular.forEach(objs, function(obj, key) {
			if (obj instanceof fabric.Group) {
				obj.visible = false;
			}
		});
		canvas.renderAll();
	}
	this.show = function(id) {
		canvas.item(id).set({
			"visible": true
		});
		canvas.renderAll();
	}
	this.hide = function(id) {
		canvas.item(id).set({
			"visible": false
		});
		canvas.renderAll();
	}

});