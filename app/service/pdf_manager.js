app.service('PDFService', function($q) {
	var SCALE = 0.8;
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
	this.init = function(src, dst, page) {
		var w = dst.getWidth(),
			h = dst.getHeight();
		var tmp = page.getViewport(1);
		var scale = w < h ? w / tmp.width : h / tmp.height;
		var view = page.getViewport(scale);

		var ctx = src.getContext('2d');
		src.width = view.width;
		src.height = view.height;

		return {
			canvasContext: ctx,
			viewport: view
		};
	};
	this.addImage = function(data, w, h) {
		var page = doc.internal.pageSize
		var k = Math.min(page.width / w, page.height / h) * SCALE;
		w *= k;
		h *= k;
		var x = Math.abs(page.width - w) / 2
		var y = 0;
		doc.addImage(data, 'jpeg', x, y, w, h);
	};

	this.save = function(name) {
		doc.output('datauri');
		// doc.save(name + '.pdf');
	}
});