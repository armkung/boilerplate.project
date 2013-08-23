var Module = function() {

}
Module.prototype.test = function() {
	console.log("Hello World!!");
}

if (typeof exports !== 'undefined') {
	module.exports = new Module();
}