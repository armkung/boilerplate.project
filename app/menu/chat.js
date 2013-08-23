app.controller('ChatCtrl', function($scope, Socket) {
	$scope.msgs = [];
	// $scope.text = "";
	// $scope.sendMsg = function() {
	// 	// console.log($scope.text);
	// 	Socket.emit("send:msg", {
	// 		msg: $scope.text
	// 	});
	// 	$scope.text = "";
	// };

	$scope.init = function() {
		Socket.on("send:msg", function(data) {
			// console.log(data);
			$scope.msgs.push(data);
		});
	};
	// $scope.show = function() {
	// 	$("#emo_btn").popover({
	// 		content: function() {
	// 			return $("#emo_pad").html();
	// 		}
	// 	});
	// };
	$scope.init();

	$scope.$watch('img',function(){
		Socket.emit("send:msg", {
			msg: $scope.img
		});
	});
});