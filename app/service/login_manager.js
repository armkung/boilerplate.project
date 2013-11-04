app.service('LoginManager', function($q, $http) {
	var self = this;


	var user;
	var deferred;
	this.level = {
		TEACHER: "teacher",
		STUDENT: "student"
	};
	this.getUser = function() {
		return user;
	};
	// this.isTeacher = function() {
	// 	return user && user.accessLevel == self.level.TEACHER;
	// };
	this.login = function(data) {
		deferred = $q.defer();
		user = data;
		user.accessLevel = self.level.TEACHER;
		// user.accessLevel = self.level.STUDENT;
		deferred.resolve();
		var obj = {
			username: user.username,
			email: user.email
		};
		// $http.jsonp("http://172.168.1.186/drupal/greedmonkey/regis?username=" 
		// 	+ user.username + "&email=" + user.email + "&callback=JSON_CALLBACK").then(function(data) {
		// 	var roles = data.data;
		// 	user.accessLevel = roles[1];
		// 	deferred.resolve(user.accessLevel);			
		// });
		return deferred.promise;
	};
	this.isTeacher = function(callback) {
		if (user && user.accessLevel == self.level.TEACHER) {
			callback();
		}
	};
	this.isStudent = function(callback) {
		if (user && user.accessLevel == self.level.STUDENT) {
			callback();
		}
	};
});