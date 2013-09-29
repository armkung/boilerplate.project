app.service('GoogleService', function($q) {
  var libs = [
    ['oauth2', 'v2'],
    ['drive', 'v2'],
    ['plus', 'v1']
  ]

  var deferred = [];
  var service = {};
  for (var i = 0; i < libs.length; i++) {
    deferred.push($q.defer());
  }
  window.signinCallback = function(authResult) {
    if (authResult['access_token']) {
      angular.forEach(libs, function(lib, key) {
        gapi.client.load(lib[0], lib[1], function() {
          service[lib[0]] = gapi.client[lib[0]];         
          deferred[key].resolve();
        });
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
    service["oauth2"].userinfo.get().execute(function(data) {
      var email = data.email;
      service["plus"].people.get({
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
          request = service["drive"].files.list({
            'pageToken': nextPageToken
          });
          retrievePageOfFiles(request, result);
        } else {
          callback(result);
        }
      });
    };

    var initialRequest = service["drive"].files.list({
      'q': "mimeType='application/vnd.google-apps.presentation'"
    });
    retrievePageOfFiles(initialRequest, []);

  };
});