app.service('LoginManager', ["$q", "$http", "host_drupal",
	function($q, $http, host_drupal) {
		var self = this;

		var deferred = $q.defer();
		this.level = {
			TEACHER: "teacher",
			STUDENT: "student"
		};
		this.getUser = function() {
			if (angular.isDefined(self.user)) {
				deferred.resolve(self.user);
			}
			return deferred.promise;
		};
		this.hasLogin = function() {
			return angular.isUndefined(self.user);
		};
		this.login = function(user) {
			self.user = user;
			// if (user.username == "Arm Kung") {
			// 	user.accessLevel = self.level.TEACHER;
			// } else {
			// 	user.accessLevel = self.level.STUDENT;
			// }
			// deferred.resolve(user);
			$http.jsonp(host_drupal + "/greedmonkey/login/" + user.email + "/" + user.username + "?callback=JSON_CALLBACK").then(function(data) {
				var roles = data.data;
				user.accessLevel = roles[1];
				deferred.resolve(user);
			});
			return deferred.promise;
		};
		this.getAccess = function() {
			return self.user.accessLevel;
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