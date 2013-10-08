app.service('LoginManager', function() {
	var self = this;

	
	var user;

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
		user = data;
		user.accessLevel = self.level.TEACHER;
	};
	this.isTeacher = function(callback) {
		if(user && user.accessLevel == self.level.TEACHER){
			callback();
		}
	};
	this.isStudent = function(callback) {
		if(user && user.accessLevel == self.level.STUDENT){
			callback();
		}
	};
});