app.service('GroupManager', ["Canvas", "DrawManager",
	function(Canvas, DrawManager) {
		var self = this;
		var canvas;
		// var objs;
		var groups;

		this.getGroups = function(users, owner) {
			groups = {};
			Canvas.getCanvas().then(function(cs) {
				canvas = cs;
				// objs = canvas.getObjects();

				// var tmp = users.slice(1);
				canvas.forEachObject(function(obj) {
					if (obj instanceof fabric.Group) {
						var user = obj.get("id");
						if (user != owner) {
							// if (users.indexOf(user) != -1) {
							groups[user] = {
								id: user,
								isHide: false,
								image: getImage(obj)
							};
							// } else {
							// 	var id = DrawManager.getFromId(user);
							// 	var item = canvas.item(id);
							// 	if (item) {
							// 		item.remove();
							// 	}
							// }
						}
					}
				});
				// angular.forEach(groups, function(group, user) {
				// if (!(user in users)) {
				// 	var id = DrawManager.getFromId(user.id);

				// 	var item = canvas.item(id);
				// 	if (item) {
				// 		item.remove();
				// 	}
				// }
				// });
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
		this.show = function(id) {
			groups[id].isHide = false;
			var index = DrawManager.getFromId(id);

			if (angular.isDefined(index)) {
				var item = canvas.item(index);
				item.set({
					"visible": true
				});
				canvas.renderAll();
			}
		};
		this.hide = function(id) {
			groups[id].isHide = true;
			var index = DrawManager.getFromId(id);

			if (angular.isDefined(index)) {
				var item = canvas.item(index);
				item.set({
					"visible": false
				});
				canvas.renderAll();
			}
		};

	}
]);