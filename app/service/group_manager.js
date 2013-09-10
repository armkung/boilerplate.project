app.service('GroupManager', function($rootScope, Canvas, Room) {
	var self = this;
	this.groups = []
	var layer;
	var children;
	this.init = function(stage) {
		layer = stage.get('Layer')[0];
		children = layer.getChildren();
		angular.forEach(children, function(group, key) {
			if (group.getId() != '') {
				self.groups.push({
					id: group.getId()
				});
			}
		});
		self.hideAll();
	}
	this.hideAll = function() {
		angular.forEach(children, function(group, key) {
			if (group.getId() != '') {
				group.hide();
			}
		});
	}
	this.show = function(id) {
		var group = layer.get('#' + id)[0];
		group.show();
		layer.draw();
	}
	this.hide = function(id) {
		var group = layer.get('#' + id)[0];
		group.hide();
		layer.draw();
	}

});