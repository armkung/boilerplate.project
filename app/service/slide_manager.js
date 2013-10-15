app.service('SlideManager', function($http, $rootScope) {
	var self = this;

	// var host = "http://www.greedmonkey.com/kreang/index.php/test/print_file/";
	var host_name = "https://docs.google.com/presentation/d/"
	var index_name = "#slide=";

	// var slide = "1-oQjVefFucKtYkHP1dgLQdt3G6OsTTnjXvAw1EyZ8Lc";
	// var slide, index;
	this.setSlide = function(id, n) {
		self.index = n ? n : 1;
		self.slide = id;
	};
	this.getUrl = function() {
		var url = host_name + self.slide + "/preview";
		var index = index_name + self.index;
		return url + index;
	};
	this.next = function() {
		self.index = changeIndex(1);
	};
	this.prev = function() {
		self.index = changeIndex(-1);
	};

	function changeIndex(k) {
		index = self.index + k;
		index = Math.max(1, index);
		return index;
	}

});