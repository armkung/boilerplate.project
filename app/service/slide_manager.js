app.service('SlideManager', function($http) {
	var self = this;

	// var host = "http://www.greedmonkey.com/kreang/index.php/test/print_file/";
	var host_name = "https://docs.google.com/presentation/d/"
	var index_name = "#slide=";

	var url, index = 1;

	// var slide = "1-oQjVefFucKtYkHP1dgLQdt3G6OsTTnjXvAw1EyZ8Lc";
	var slide;
	this.init = function(redirect) {
		// var data_url = host + slide + "?callback=JSON_CALLBACK";
		// $http.jsonp(data_url).success(function(data) {
		// 	self.url = data.url;
		// });
		if (slide) {
			self.setSlide(slide);
			self.url = host_name + slide + "/preview";
		}else{
			redirect()
		}
	};
	this.setSlide = function(id) {
		index = 1;
		slide = id;
		self.setPage(index);
	}
	this.setPage = function(index) {
		self.index = index_name + index;
	}
	this.getIndex = function() {
		return index;
	};
	this.next = function() {
		self.index = index_name + changeIndex(1);
	};
	this.prev = function() {
		self.index = index_name + changeIndex(-1);
	};

	function changeIndex(n) {
		index = index + n;
		index = Math.max(1, index);
		return index;
	}

});