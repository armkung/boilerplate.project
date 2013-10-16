app.service('GoogleService', function($q) {
	var libs = [
		['oauth2', 'v2'],
		['drive', 'v2'],
		['plus', 'v1']
	]

	var defers = [];
	var service = {};
	for (var i = 0; i < libs.length; i++) {
		defers.push($q.defer());
	}
	window.signinCallback = function(authResult) {
		if (authResult['access_token']) {
			angular.forEach(libs, function(lib, key) {
				gapi.client.load(lib[0], lib[1], function() {
					service[lib[0]] = gapi.client[lib[0]];
					defers[key].resolve();
				});
			});
		} else if (authResult['error']) {

		}
	};
	this.load = function() {
		var promises = [];
		angular.forEach(defers, function(task, key) {
			promises.push(task.promise);
		});
		return $q.all(promises);
	};
	this.getUser = function() {
		var deferred = $q.defer();
		service["oauth2"].userinfo.get().execute(function(data) {
			var email = data.email;
			service["plus"].people.get({
				'userId': 'me'
			}).execute(function(data) {
				var username = data.displayName;
				deferred.resolve({
					email: email,
					username: username
				});
			});
		})
		return deferred.promise;
	};
	this.shareFile = function(id) {
		var deferred = $q.defer();
		var body = {
		   'value': 'anand.kung@mail.kmutt.ac.th',
		   'type': 'group',
		   'role': 'reader'
		 };
		 var request = gapi.client.drive.permissions.insert({
		   'fileId': id,
		   'resource': body
		 });
		 request.execute(function(resp) { 
		 	deferred.resolve(resp);
		 });
		 return deferred.promise;
	};
	this.listFile = function() {
		var deferred = $q.defer();
		var retrievePageOfFiles = function(request, result) {
			request.execute(function(resp) {
				result = result.concat(resp.items);
				var nextPageToken = resp.nextPageToken;
				if (nextPageToken) {
					request = service["drive"].files.list({
						'pageToken': nextPageToken
					});
					retrievePageOfFiles(request, result);
				} else {
					deferred.resolve(result);
				}
			});
		};

		var initialRequest = service["drive"].files.list({
			'q': "mimeType='application/vnd.google-apps.presentation'"
		});
		retrievePageOfFiles(initialRequest, []);
		return deferred.promise;
	};
});