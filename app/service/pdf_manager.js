app.service('PDFService', function($q) {

	this.load = function(url) {
		var deferred = $q.defer();
		PDFJS.disableWorker = true;
		PDFJS.getDocument(url).then(function(pdf) {
			pdf.getPage(1).then(function(page) {
				deferred.resolve(page);
			});
		});
		return deferred.promise;
	};
});