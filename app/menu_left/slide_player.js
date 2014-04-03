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

				control.volume = 0;
				control.addEventListener('pause', function() {
					list[PlayerManager.index-1].pause();
				});
				control.addEventListener('play', function() {
					list[PlayerManager.index-1].play();
				});
				control.addEventListener('seeking', function() {
					list[PlayerManager.index-1].setTime(control.currentTime);
				});

				// setPlayer(0, false);
				PlayerManager.setAudio(control, function(audio, i) {
					fotorama.show(i);
					// PlayerManager.setSource(list[i-1], control);
				});
				PlayerManager.setSource(list[0], control);
				player.on('fotorama:showend', function(e, fotorama, extra) {
					var index = fotorama.activeFrame.i;
					// if (PlayerManager.index != index || PlayerManager.index == 1) {
					console.log('index', index);
					PlayerManager.index = index;
					PlayerManager.setSource(list[index - 1], control);
					control.play();
				});

			}
		};
	}
])