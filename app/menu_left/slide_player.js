app.directive('slidePlayer', [

	function() {
		return {
			restrict: 'E',
			template: '<div class="fotorama"' +
				'data-height="700"' +
				'data-maxheight="50%"' +
				'data-loop="false"' +
				'data-nav="thumbs">' +
				'</div>',
			link: function(scope, iElement, iAttrs) {
				var IMAGE_TYPE = "png";
				var AUDIO_TYPE = ["wav", "mp3"];

				var player = $('.fotorama');
				var fotorama = player.fotorama().data('fotorama');
				var list = ['test', 'test'];
				var audio;
				var slides = ["assets/emoticon/1", "assets/emoticon/2"];
				angular.forEach(slides, function(slide, key) {
					fotorama.push({
						img: slide + "." + IMAGE_TYPE,
						thumb: slide + "." + IMAGE_TYPE
					});
				});
				player.on('fotorama:ready fotorama:showend', function(e, fotorama, extra) {
					var index = fotorama.activeFrame.i - 1;
					console.log('active frame', index);
					if (audio) {
						audio.unbind("ended");
						audio.stop();
						audio.load();
					}
					audio = new buzz.sound("http://localhost/wbl/server/audio/" + list[index], {
						formats: AUDIO_TYPE
					});

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