app.service('PDFService', function($q, $timeout) {
	var self = this;

	var SCALE = 0.8;
	var TYPE = "image/jpeg";
	var DELAY = 500;

	var doc = new jsPDF();
	var scale;
	var i = 1;
	var renderContext;
	var drawCanvas, slideCanvas;
	this.load = function(url) {
		var deferred = $q.defer();
		PDFJS.disableWorker = true;
		PDFJS.getDocument(url).then(function(pdf) {
			// pdf.getPage(1).then(function(page) {			
			deferred.resolve(pdf);
			// });
		});
		return deferred.promise;
	};
	this.init = function(dc) {
		var sc = $('<canvas/>')[0];
		var ctx = sc.getContext('2d');

		drawCanvas = dc;
		slideCanvas = sc;
		renderContext = {
			canvasContext: ctx
		};
	};

	function setScale(page) {
		var w = drawCanvas.getWidth(),
			h = drawCanvas.getHeight();
		var tmp = page.getViewport(1);
		return w < h ? w / tmp.width : h / tmp.height;
	}
	this.render = function(pdf, n) {
		var deferred = $q.defer();
		// var stop = $timeout(function() {
		var render = function() {
			pdf.getPage(i).then(function(page) {
				if (!scale) {
					scale = setScale(page);
					// console.log(DELAY);
				}
				var view = page.getViewport(scale);

				slideCanvas.width = view.width;
				slideCanvas.height = view.height;

				renderContext.viewport = view;

				var w = view.width,
					h = view.height;

				page.render(renderContext).then(function() {
					fabric.Image.fromURL(slideCanvas.toDataURL(), function(img) {
						drawCanvas.add(img);
						img.set({
							stroke: 'black',
							strokeWidth: 3
						});
						img.center();
						img.setCoords();
						drawCanvas.sendToBack(img);

						drawCanvas.renderAll();

						var data = drawCanvas.toDataURL({
							format: TYPE.split('/')[1],
							top: img.getTop() - img.getHeight() / 2,
							left: img.getLeft() - img.getWidth() / 2,
							width: w,
							height: h
						});
						console.log(data);

						self.addImage(data, w, h);

						drawCanvas.remove(img);
						if (i == n) {
							var data = self.save();
							deferred.resolve(data);
							// $timeout.cancel(stop);
							return;
							// return self.save();
						} else {
							i++;
							render();
						}
					});
				});
			});
		}
		render();
		// }, DELAY);
		return deferred.promise;
	};
	this.addImage = function(data, w, h) {
		var page = doc.internal.pageSize
		var k = Math.min(page.width / w, page.height / h) * SCALE;
		w *= k;
		h *= k;
		var x = Math.abs(page.width - w) / 2
		var y = page.height * ((i - 1) % 2) / 2;
		doc.addImage(data, 'jpeg', x, y, w, h);
		if (i % 2 == 0) {
			doc.addPage();
		}
	};

	this.save = function() {
		// doc.output('datauri');
		return doc.output('datauristring');
		// doc.save(name + '.pdf');
	}
});