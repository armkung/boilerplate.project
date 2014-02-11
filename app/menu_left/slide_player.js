app.directive('slidePlayer', ["PlayerManager",
	function(PlayerManager) {
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


				var player = $('.fotorama');
				var fotorama = player.fotorama().data('fotorama');
				var control = $('#control')[0];

				var list = [];
				var datas = PlayerManager.getData(control);
				angular.forEach(datas, function(data, key) {
					fotorama.push(data.slide);
					list.push(data.audio);
				});

				// function setPlayer(index, isPlay) {
				// 	audio = list[index];
				// 	if (audio) {
				// 		audio.unbind("ended");
				// 		audio.stop();
				// 		audio.load();
				// 	}
				// 	audio.bindOnce("ended", function() {
				// 		if (index < list.length - 1) {
				// 			fotorama.show('>');
				// 		}
				// 	})
				// 	if (isPlay) {
				// 		audio.play();
				// 	}
				// }

				// setPlayer(0, false);
				PlayerManager.setAudio(function(audio) {
					fotorama.show(1);
				});
				player.on('fotorama:ready fotorama:showend', function(e, fotorama, extra) {
					var index = fotorama.activeFrame.i - 1;
					if (PlayerManager.index != index || PlayerManager.index == 0) {
						console.log('index', index);
						// setPlayer(index, true);
						list[PlayerManager.index].stop();
						list[PlayerManager.index].load();

						PlayerManager.index = index;
						list[index].play();
						PlayerManager.setAudio(function(audio) {
							fotorama.show(index + 1);
						});
					}
				});

			}
		};
	}
])