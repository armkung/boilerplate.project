app.service('GroupManager', function($rootScope, Canvas, Room) {
	var self = this;
	var canvas;
	var objs;
	var groups = [];
	this.init = function(cs) {
		canvas = cs;
		objs = canvas.getObjects();
	};
	this.getGroups = function(users) {
		var tmp = users.slice(0);
		angular.forEach(objs, function(obj, key) {
			if (obj instanceof fabric.Group) {
				var user = tmp.shift();
				if (!(user in groups)) {
					groups.push({
						user: user,
						id: key,
						isHide: false
					});
					// self.hide(groups.length - 1);
				}
			}
		});
		angular.forEach(groups, function(group, user) {
			if (!(user in users)) {
				canvas.item(group.id).remove();
			};
		});
		canvas.renderAll();

		return groups;
	};
	this.showAll = function() {
		angular.forEach(groups, function(group, key) {
			self.show(key)
		});
	};
	this.hideAll = function() {
		angular.forEach(groups, function(group, key) {
			self.hide(key)
		});
	};
	this.show = function(index) {
		var id = groups[index].id
		groups[index].isHide = false;
		canvas.item(id).set({
			"visible": true
		});
		canvas.renderAll();
	};
	this.hide = function(index) {
		var id = groups[index].id
		groups[index].isHide = true;
		canvas.item(id).set({
			"visible": false
		});
		canvas.renderAll();
	};

});