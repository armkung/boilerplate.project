app.service("PlayerManager", ["$q", "$rootScope", "host_server",

	function($q, $rootScope, host_server) {
		var self = this;
		var IMAGE_TYPE = "png";
		var AUDIO_TYPE = ["wav"];

		var names = [];
		var length = 0;
		var url = "",
			title = "";
		// var audio, list = [];
		var list = [];
		this.index = 0;
		this.setData = function(l, u, t) {
			length = l;
			url = u;
			title = t;
		}
		this.setAudio = function(callback) {
			for (var i = 0; i < list.length; i++) {
				var audio = list[i].audio;				
				audio.bind("ended", function() {
					if (self.index < list.length - 1) {
						callback(audio);
					}
				});
			};
		}
		this.getData = function(document) {
			list = [];
			for (var i = 1; i <= length; i++) {
				var path = host_server + "/" + url + title + "/" + i;
				var slide = {
					img: path + "." + IMAGE_TYPE,
					thumb: path + "." + IMAGE_TYPE
				};
				var audio = new buzz.sound(path, {
					document: control,
					formats: AUDIO_TYPE
				})
				list.push({
					slide: slide,
					audio: audio
				});
			};
			return list;
			// angular.forEach(data, function(name, key) {
			// callback(path, name);
			// });
		}
		// this.getData = function() {
		// 	return list;
		// }
	}
]);