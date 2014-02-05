app.directive('slidePlayer', ["host_audio",
	function(host_audio) {
		return {
			restrict: 'E',
			template: '<div class="fotorama"' +
				'data-height="100%"' +
				'data-width="100%"' +
				'data-maxheight="70%"' +
				'data-loop="false"' +
				'data-nav="thumbs">' +
				'</div>',
			link: function(scope, iElement, iAttrs) {
				var IMAGE_TYPE = "png";
				var AUDIO_TYPE = ["wav"];

				var names = ['test', 'test'];
				var url = "http://localhost/wbl/server/audio/";
				// var url = host_audio;
				var player = $('.fotorama');
				var fotorama = player.fotorama().data('fotorama');
				var audio, list = [];

				var control = $('#control')[0];
				angular.forEach(names, function(name, key) {
					var path = url + name;
					fotorama.push({
						img: path + "." + IMAGE_TYPE,
						thumb: path + "." + IMAGE_TYPE
					});

					list.push(new buzz.sound(path, {
						document: control,
						formats: AUDIO_TYPE
					}));
				});
				player.on('fotorama:ready fotorama:showend', function(e, fotorama, extra) {
					var index = fotorama.activeFrame.i - 1;
					console.log('index', index);

					audio = list[index];
					if (audio) {
						audio.unbind("ended");
						audio.stop();
						audio.load();
					}

					audio.play().bindOnce("ended", function() {
						if (index < list.length - 1) {
							fotorama.show('>');
						}
					})
				});
			}
		};
	}
])