app.service('PDFService', function($q) {
	var SCALE = 0.8;
	var doc = new jsPDF();
	var scale;
	var i = 0,
		n;
	this.load = function(url) {
		var deferred = $q.defer();
		PDFJS.disableWorker = true;
		PDFJS.getDocument(url).then(function(pdf) {
			// pdf.getPage(1).then(function(page) {
			n = pdf.pdfInfo.numPages;
			deferred.resolve(pdf);
			// });
		});
		return deferred.promise;
	};
	this.init = function(src, dst, page) {
		var w = dst.getWidth(),
			h = dst.getHeight();
		if (!scale) {
			var tmp = page.getViewport(1);
			scale = w < h ? w / tmp.width : h / tmp.height;
		}
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
		var y = page.height * (i++) / 2;
		console.log(w + " " + h)
		doc.addImage(data, 'jpeg', x, y, w, h);
		if (i == n) {
			doc.output('datauri');
		}
	};

	this.save = function(name) {		
		// doc.save(name + '.pdf');
	}
});