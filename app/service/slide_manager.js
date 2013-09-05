app.service('SlideManager', function($http) {
	var self = this;

	var host = "http://www.greedmonkey.com/kreang/index.php/test/print_file/";
	var slide = "1-oQjVefFucKtYkHP1dgLQdt3G6OsTTnjXvAw1EyZ8Lc";
	var id = "#slide=";

	var url, index = 1;
	this.ctrls = {};
	this.url = '';
	this.init = function() {
		var data_url = host + slide + "?callback=JSON_CALLBACK";
		$http.jsonp(data_url).success(function(data) {
			self.url = data.url;
		});
	}
	this.nextIndex = function() {
		self.index = url + id + (++index);
	};
	this.prevIndex = function() {
		self.index = url + id + (--index);
	};
})