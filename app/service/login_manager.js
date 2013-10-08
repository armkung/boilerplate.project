app.service('LoginManager', function() {
	var self = this;

	var user;

	this.level = {
		TEACHER: "teacher",
		STUDENT: "student"
	}
	this.getUser = function() {
		return user;
	}
	this.isTeacher = function() {
		return user && user.accessLevel == self.level.TEACHER;;
	}
	this.login = function(data) {
		user = data;
		user.accessLevel = self.level.TEACHER;
	};
});