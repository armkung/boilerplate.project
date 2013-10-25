app.service('PDFService', function($q) {

	var doc = new jsPDF();

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
	this.init = function(canvas, page, w, h) {
		var tmp = page.getViewport(1);
		var scale = w < h ? w / tmp.width : h / tmp.height;
		var view = page.getViewport(scale);

		// var canvas = $('#pdf')[0];
		var ctx = canvas.getContext('2d');
		canvas.width = view.width;
		canvas.height = view.height;

		return {
			canvasContext: ctx,
			viewport: view
		};
	};
	this.addImage = function(data, w, h) {
		var k = Math.min(doc.internal.pageSize.width / w, doc.internal.pageSize.height / h);
		doc.addImage(data, 'jpeg', 0, 0, w * k, h * k);
	};

	this.save = function(name) {
		doc.output('datauri');
		// doc.save(name + '.pdf');
	}
});