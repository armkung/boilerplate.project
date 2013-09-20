app.service('SlideManager', function($http) {
	var self = this;

	// var host = "http://www.greedmonkey.com/kreang/index.php/test/print_file/";
	var host = "https://docs.google.com/presentation/d/"
	var id = "#slide=";

	var url, index = 1;

	this.slide = "1-oQjVefFucKtYkHP1dgLQdt3G6OsTTnjXvAw1EyZ8Lc";
	this.index = id + index;
	this.init = function() {
		// var data_url = host + slide + "?callback=JSON_CALLBACK";
		// $http.jsonp(data_url).success(function(data) {
		// 	self.url = data.url;
		// });
		self.url = host + self.slide + "/preview";
	}
	this.getIndex =  function() {
		return index;
	};
	this.next = function() {
		self.index = id + changeIndex(1);
	};
	this.prev = function() {
		self.index = id + changeIndex(-1);
	};

	function changeIndex(n) {
		index = index + n;
		index = Math.max(1, index);
		return index;
	}
})