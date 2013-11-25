app.service('SlideManager', function($http, $q, $rootScope) {
	var self = this;

	// var host = "http://www.greedmonkey.com/kreang/index.php/test/print_file/";
	var host_name = "https://docs.google.com/presentation/d/";
	var index_name = "#slide=";

	// var slide = "1-oQjVefFucKtYkHP1dgLQdt3G6OsTTnjXvAw1EyZ8Lc";
	// var slide, index;
	var deferred;
	this.index = 0;
	this.setMax = function(df) {
		deferred = df;
	};
	this.getMax = function() {
		if (!deferred) {
			deferred = $q.defer();
		}
		return deferred.promise;
	};
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
		// if (!max) {
		// 	deferred.promise.then(function(data) {
		// 		max = data;
		// 		self.index = changeIndex(1);
		// 	})
		// } else {
		self.index = changeIndex(1);
		// }
	};
	this.prev = function() {
		self.index = changeIndex(-1);
	};
	this.isStart = function() {
		return self.index == 1;
	};
	this.isEnd = function() {
		return self.index == self.max;
	};

	function changeIndex(k) {
		var index = self.index + k;
		index = Math.max(1, index);
		return index <= self.max || angular.isUndefined(self.max) ? index : self.max;
	}

});