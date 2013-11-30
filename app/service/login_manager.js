app.service('LoginManager', ["$q", "$http", "host_drupal",
	function($q, $http, host_drupal) {
		var self = this;

		var user;
		var deferred = $q.defer();
		this.level = {
			TEACHER: "teacher",
			STUDENT: "student"
		};
		this.getUser = function() {
			if (user) {
				deferred.resolve(user);
			}
			return deferred.promise;
		};
		this.hasLogin = function() {
			return angular.isUndefined(user);
		};
		this.login = function(data) {
			user = data;
			if (user.username == "Arm Kung") {
				user.accessLevel = self.level.STUDENT;
			} else {
				user.accessLevel = self.level.TEACHER;
			}
			deferred.resolve(user);
			var obj = {
				username: user.username,
				email: user.email
			};
			// $http.jsonp(host_drupal + "/greedmonkey/login/" + user.email + "/" + user.username + "?callback=JSON_CALLBACK").then(function(data) {
			// 	var roles = data.data;
			// 	user.accessLevel = roles[1];
			// 	deferred.resolve(user.accessLevel);
			// });
			return deferred.promise;
		};
		this.getAccess = function() {
			return user.accessLevel;
		};
		// this.isTeacher = function(callback) {
		// 	if (user && user.accessLevel == self.level.TEACHER) {
		// 		callback();
		// 	}
		// };
		// this.isStudent = function(callback) {
		// 	if (user && user.accessLevel == self.level.STUDENT) {
		// 		callback();
		// 	}
		// };
	}
]);