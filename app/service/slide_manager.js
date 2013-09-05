app.service('SlideManager', function($rootScope) {
	this.ctrls = {};
	this.index = 1;
	this.init = function() {
		$('#slide').load(function() {
			// console.log($(this).contents().find('html'))
			// $(this).contents().remove('.punch-viewer-nav');
			// console.log($('#slide').contents().find("html").html());
			// $rootScope.$apply();
		});
	}
	this.next = function() {

	}
})