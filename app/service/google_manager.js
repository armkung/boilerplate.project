app.service('GoogleService', ["$q",
	function($q) {
		var self = this;

		var libs = [
			['oauth2', 'v2'],
			['drive', 'v2'],
			['plus', 'v1']
		];

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
			angular.forEach(defers, function(defer, key) {
				promises.push(defer.promise);
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
			});
			return deferred.promise;
		};
		this.setPermission = function(id) {
			var deferred = $q.defer();
			var body = {
				'type': 'anyone',
				'role': 'reader'
			};
			var request = gapi.client.drive.permissions.insert({
				'fileId': id,
				'resource': body
			});
			request.execute(function(resp) {
				deferred.resolve();
			});
			return deferred.promise;

		};
		this.getFile = function(id) {
			var deferred = $q.defer();
			var request = service["drive"].files.get({
				'fileId': id
			});
			request.execute(function(resp) {
				self.setPermission(id).then(function() {
					deferred.resolve(resp);
				});
			});
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
		this.insertFile = function(fileData) {
			var deferred = $q.defer();

			const boundary = '-------314159265358979323846';
			const delimiter = "\r\n--" + boundary + "\r\n";
			const close_delim = "\r\n--" + boundary + "--";

			var base64Data = fileData.data;
			// base64Data.replace("/^data:image\/(png|jpg|jpeg);base64,/", "");

			var metadata = {
				'title': fileData.fileName,
				'mimeType': fileData.type
			};

			var multipartRequestBody =
				delimiter +
				'Content-Type: application/json\r\n\r\n' +
				JSON.stringify(metadata) +
				delimiter +
				'Content-Type: ' + metadata.mimeType + '\r\n' +
				'Content-Transfer-Encoding: base64\r\n' +
				'\r\n' +
				base64Data +
				close_delim;
			var request = gapi.client.request({
				'path': '/upload/drive/v2/files',
				'method': 'POST',
				'params': {
					'uploadType': 'multipart'
				},
				'headers': {
					'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
				},
				'body': multipartRequestBody
			});


			request.execute(function(resp) {
				deferred.resolve(resp);
			});

			return deferred.promise;
		};
	}
]);