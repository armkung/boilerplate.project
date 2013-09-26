app.service('GoogleService', function($q) {
  var deferred = [];
  var drive, plus, oauth2;
  for (var i = 0; i <= 2; i++) {
    deferred.push($q.defer());
  }
  window.signinCallback = function(authResult) {
    if (authResult['access_token']) {
      gapi.client.load('oauth2', 'v2', function() {
        oauth2 = gapi.client.oauth2;
        deferred[0].resolve();
      });
      gapi.client.load('drive', 'v2', function() {
        drive = gapi.client.drive;
        deferred[1].resolve();
      });
      gapi.client.load('plus', 'v1', function() {
        plus = gapi.client.plus;
        deferred[2].resolve();
      });
    } else if (authResult['error']) {

    }
  };
  this.load = function() {
    var promises = [];
    angular.forEach(deferred, function(task, key) {
      promises.push(task.promise);
    });
    return $q.all(promises);
  };
  this.getUser = function(callback) {
    oauth2.userinfo.get().execute(function(data) {
      var email = data.email;
      plus.people.get({
        'userId': 'me'
      }).execute(function(data) {
        var username = data.displayName;
        callback({
          email: email,
          username: username
        });
      });

    })
  };
  this.listFile = function(callback) {
    var retrievePageOfFiles = function(request, result) {
      request.execute(function(resp) {
        result = result.concat(resp.items);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = drive.files.list({
            'pageToken': nextPageToken
          });
          retrievePageOfFiles(request, result);
        } else {
          callback(result);
        }
      });
    };

    var initialRequest = drive.files.list();
    retrievePageOfFiles(initialRequest, []);

  };
});