app.service("PlayerManager", ["$q", "$rootScope", "host_server",

	function($q, $rootScope, host_server) {
		var self = this;
		var IMAGE_TYPE = "png";
		var AUDIO_TYPE = "wav";

		var names = [];
		var length = 0;
		var url = "",
			title = "";
		// var audio, list = [];
		var list = [];
		this.index = 1;
		this.setData = function(l, u, t) {
			length = l;
			url = u;
			title = t;
		}

		this.setSource = function(audio, control) {
			var path = host_server + "/" + url + title + "/" + self.index + "." + AUDIO_TYPE;
			control.src = path;
			control.load();
			// control.play();
			// audio.play();
		}
		this.setAudio = function(control, callback) {
			// self.setSource(list[0].audio, control, 1);
			for (var i = 0; i < list.length; i++) {
				var audio = list[i].audio;
				audio.bind("ended", function() {
					if (self.index < list.length) {
						callback(audio, self.index);
						self.index++
					}
					// self.index++;
					// self.setSource(audio, control, self.index);
				});
			};
		}
		this.getData = function(control) {
			list = [];
			for (var i = 1; i <= length; i++) {
				var path = host_server + "/" + url + title + "/" + i;
				var slide = {
					img: path + "." + IMAGE_TYPE,
					thumb: path + "." + IMAGE_TYPE
				};
				// console.log(path)
				var audio = new buzz.sound(path, {
					// document: control,
					formats: [AUDIO_TYPE]
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