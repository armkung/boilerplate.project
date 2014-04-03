app.service("VoiceManager", ["$q", "$rootScope", "Room", "host_node",

	function($q, $rootScope, Room, host_node) {
		var self = this;
		var recorder;
		var audioContext;
		var deferred = $q.defer();
		var unbind;
		var isRecord = false;
		this.init = function() {
			if (angular.isUndefined(recorder)) {
				navigator.getMedia = (navigator.getUserMedia ||
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia);
				navigator.getMedia({
						"audio": true,
						"video": false
					}, function(stream) {
						audioContext = new webkitAudioContext();
						var mediaStreamSource = audioContext.createMediaStreamSource(stream);
						// mediaStreamSource.connect(audioContext.destination);

						// var zeroGain = audioContext.createGain();
						// zeroGain.gain.value = 0;
						// mediaStreamSource.connect(zeroGain);
						// zeroGain.connect(audioContext.destination);

						recorder = new Recorder(mediaStreamSource, {
							workerPath: "vendor/Recorderjs/recorderWorker.js"
						});
						$rootScope.$broadcast('voice', recorder);

						// isRecord = true;
					},
					function(err) {
						isRecord = false;
						console.log(err);
					});
			}
		}
		this.isRecord = function() {
			return isRecord;
		}
		this.start = function() {
			if (recorder) {
				recorder.clear();
				recorder.record()
				isRecord = true;
			} else {
				if (unbind) {
					unbind();
				}
				unbind = $rootScope.$on('voice', function(e, rc) {
					recorder = rc;
					recorder.clear();
					recorder.record()
					// isRecord = true;
				});

			}
		}

		this.stop = function(index) {
			if (isRecord) {
				isRecord = false;
				recorder.stop();
				var reader = new FileReader();
				reader.addEventListener("loadend", function(e) {
					console.log(reader.result)
				});

				recorder.exportWAV(function(wav) {
					// var url = (window.URL || window.webkitURL).createObjectURL(wav);
					// $("#recorded-audio").attr("src", url);
					// $("#recorded-audio").attr("autoplay", true);
					// $("#recorded-audio").get()[0].load();
					// $rootScope.$apply();
					// console.log($("#recorded-audio"));
					// console.log(url);

					var form = new FormData();
					if (index == 1) {
						form.append("init", Room.room);
					}
					form.append(Room.room, wav, index + ".wav");
					$.ajax({
						url: host_node,
						type: "POST",
						data: form,
						processData: false,
						contentType: false,
						success: function(response) {
							// console.log(response);
						},
						error: function(jqXHR, textStatus, errorMessage) {
							// console.log(errorMessage);
						}
					});

					reader.readAsDataURL(wav);
				});
			}
		}

		this.playback = function() {
			recorder.getBuffer(function(buffers) {
				if (audioContext) {
					var source = audioContext.createBufferSource();
					source.buffer = audioContext.createBuffer(1, buffers[0].length, 44100);
					source.buffer.getChannelData(0).set(buffers[0]);
					source.buffer.getChannelData(0).set(buffers[1]);
					source.connect(audioContext.destination);
					source.noteOn(0);
				}
			});
		}
	}
]);