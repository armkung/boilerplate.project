app.service('PDFService', ["$q", "$timeout", "GoogleService",
	function($q, $timeout, GoogleService) {
		var self = this;

		var SCALE = 0.8;
		var TYPE = "jpeg";

		var doc = new jsPDF();
		var scale;
		var i = 1;
		var renderContext;
		var mirrors, slideCanvas;
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
		this.init = function(mrs) {
			var sc = $('<canvas/>')[0];
			var ctx = sc.getContext('2d');

			mirrors = mrs;
			slideCanvas = sc;
			renderContext = {
				canvasContext: ctx
			};
		};
		this.getPdf = function(id) {
			var deferred = $q.defer();
			GoogleService.getFile(id).then(function(data) {
				var url = data.exportLinks['application/pdf'];
				self.load(url).then(function(pdf) {
					deferred.resolve(pdf);
				});
			});
			return deferred.promise;
		};



		function setScale(page) {
			var drawCanvas = mirrors[0];
			var w = drawCanvas.getWidth(),
				h = drawCanvas.getHeight();
			var tmp = page.getViewport(1);
			return w < h ? w / tmp.width : h / tmp.height;
		}
		this.renderImage = function(pdf, n, callback) {
			var deferred = $q.defer();
			var render = function() {
				pdf.getPage(i).then(function(page) {
					var drawCanvas = mirrors[i - 1];
					if (!scale) {
						scale = setScale(page);
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
							img.center();
							img.setCoords();
							drawCanvas.sendToBack(img);
							drawCanvas.renderAll();

							callback(drawCanvas.toDataURL({
								top: img.getTop(),
								left: img.getLeft(),
								width: img.getWidth(),
								height: img.getHeight()
							}), i);
							if (i == n) {
								// deferred.resolve();
								i = 1;
								return;
							} else {
								i++;
								render();
							}
						});
					});
				});
			};
			render();
			// return deferred.promise;
		};
		this.renderPdf = function(pdf, n) {
			var deferred = $q.defer();
			var render = function() {
				pdf.getPage(i).then(function(page) {
					var drawCanvas = mirrors[i - 1];
					if (!scale) {
						scale = setScale(page);
					}
					var view = page.getViewport(scale);

					slideCanvas.width = view.width;
					slideCanvas.height = view.height;

					renderContext.viewport = view;

					var w = view.width,
						h = view.height;

					page.render(renderContext).then(function() {
						var stroke = 2;
						fabric.Image.fromURL(slideCanvas.toDataURL(), function(img) {
							drawCanvas.add(img);
							img.set({
								stroke: 'black',
								strokeWidth: stroke
							});
							img.center();
							img.setCoords();
							drawCanvas.sendToBack(img);
							drawCanvas.renderAll();
							var data = drawCanvas.toDataURL({
								format: TYPE,
								top: img.getTop(),
								left: img.getLeft(),
								width: img.getWidth() + stroke,
								height: img.getHeight() + stroke
							});
							console.log(data);

							self.addImage(data, i, w, h);

							drawCanvas.remove(img);
							if (i == n) {
								i = 1;
								deferred.resolve(self.save());
								return;
								// return self.save();
							} else {
								self.addPage(i);
								i++;
								render();
							}
						});
					});
				});
			};
			render();
			return deferred.promise;
		};
		this.addImage = function(data, i, w, h) {
			var page = doc.internal.pageSize;
			var k = Math.min(page.width / w, page.height / h) * SCALE;
			w *= k;
			h *= k;
			var x = Math.abs(page.width - w) / 2;
			var y = page.height * ((i - 1) % 2) / 2;
			doc.addImage(data, 'jpeg', x, y, w, h);
		};

		this.addPage = function(i) {
			if (i % 2 === 0) {
				doc.addPage();
			}
		};
		this.save = function() {
			// doc.output('datauri');
			return doc.output('datauristring');
			// doc.save(name + '.pdf');
		};
	}
]);