app.service('GroupManager', ["$rootScope", "Canvas",
	function($rootScope, Canvas) {
		var self = this;
		var canvas;
		var objs;
		var groups;

		this.getGroups = function(users) {
			groups = [];
			Canvas.getCanvas().then(function(cs) {
				canvas = cs;
				objs = canvas.getObjects();
				var tmp = users.slice(0);
				angular.forEach(objs, function(obj, key) {
					if (obj instanceof fabric.Group) {
						var user = tmp.shift();
						if (!(user in groups)) {
							groups.push({
								user: user,
								id: key,
								isHide: false,
								image: getImage(obj)
							});
							// self.hide(groups.length - 1);
						}
					}
				});
				angular.forEach(groups, function(group, user) {
					if (!(user in users)) {
						canvas.item(group.id).remove();
					}
				});
				canvas.renderAll();
			});

			return groups;
		};

		function getImage(obj) {
			var canvas = Canvas.newCanvas("data", Canvas.width, Canvas.height);
			canvas.setBackgroundColor("white");
			canvas.add(obj);
			canvas.renderAll();

			return canvas.toDataURL();
		}
		this.showAll = function() {
			angular.forEach(groups, function(group, key) {
				self.show(key);
			});
		};
		this.hideAll = function() {
			angular.forEach(groups, function(group, key) {
				self.hide(key);
			});
		};
		this.show = function(index) {
			var id = groups[index].id;
			groups[index].isHide = false;
			canvas.item(id).set({
				"visible": true
			});
			canvas.renderAll();
		};
		this.hide = function(index) {
			var id = groups[index].id;
			groups[index].isHide = true;
			canvas.item(id).set({
				"visible": false
			});
			canvas.renderAll();
		};

	}
]);