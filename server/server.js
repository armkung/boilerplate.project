var config = require('./module/config.js');
var formidable = require('formidable');
var http = require('http');
var util = require('util');
var fs = require('fs');

var server = http.createServer().listen(8080);

server.on('request', function(request, response) {
	var form = new formidable.IncomingForm()
	form.encoding = 'utf8';
	form.uploadDir = config.audio_path;
	form.keepExtensions = true;
	form.parse(request);

	response.writeHead(200, {
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,POST'
	});

	form.on('error', function(err) {
		response.writeHead(200, {
			'content-type': 'text/plain'
		});
		response.end('error:\n\n' + util.inspect(err));
	});

	form.on('field', function(field, value) {
		if (field == "init") {
			var path = form.uploadDir + value;

			function removeDir(path) {
				if (fs.existsSync(path)) {
					fs.readdirSync(path).forEach(function(file, index) {
						var curPath = path + "/" + file;
						if (fs.statSync(curPath).isDirectory()) {
							removeDir(curPath);
						} else {
							fs.unlinkSync(curPath);
						}
					});
					fs.rmdirSync(path);
				}
			};
			removeDir(path);
		}
	});
	form.on('file', function(field, file) {
		var path = form.uploadDir + field;
		fs.mkdir(path, function(e) {
			fs.rename(file.path, path + '/' + file.name, function(err) {
				if (err) {
					console.log("error " + err);
				}
			});
		});
		// fs.rename(file.path, form.uploadDir + file.name, function(err) {
		// 	if (err) {
		// 		console.log("error");
		// 	} else {
		// 		console.log("success");
		// 	}
		// });

		// fs.readFile(file.path, function(err, data) {
		// 	fs.writeFile(__dirname + '/audio' +
		// 		file.name,
		// 		data,
		// 		'binary',
		// 		function(err) {
		// 			if (err) {
		// 				console.log("error");
		// 			} else {
		// 				console.log("success");
		// 			}
		// 		});
		// });
	});

	form.on('end', function() {
		response.end('');
	});

});

var io = require('socket.io').listen(server);
// var md = require('./module/module.js');
// md.test()
// var builder = require('xmlbuilder');

io.set('log level', 1);

var Logger = function() {
	var data = {};
	var room;
	this.logData = data;
	this.init = function(name, rm) {
		room = name;
		if (!(room in data)) {
			data[name] = {
				room: rm,
				users: {},
				msg: [],
				pos: {}
			};
		}
	}
	this.getEmails = function() {
		var emails = [];
		if (data[room]) {
			for (name in data[room].users) {
				emails.push(data[room].users[name].email);
			}
		}
		return emails;
	}
	this.logUser = function(id, user) {
		if (data[room]) {
			data[room].users[user.username] = {
				display: user.display,
				id: id,
				email: user.email
			}
		}
	}
	this.logMsg = function(msg) {
		if (data[room]) {
			data[room].msg.push(msg);
		}
	}

	this.logPos = function(pos) {
		if (data[room]) {
			if (!data[room].pos[pos.name]) {
				data[room].pos[pos.name] = [];
			}
			data[room].pos[pos.name].push(pos);
			if (pos.type == 'clear') {
				var obj = data[room].pos[pos.name];
				for (var i = obj.length - 1; i >= 0; i--) {
					if (obj[i].user.id == pos.user.id) {
						data[room].pos[pos.name].splice(i, 1);
					}
				}
			}
		}
	}

	this.logSlide = function(slide) {
		if (data[room]) {
			data[room].slide = slide;
		}
	}

	this.logQuiz = function(quiz) {
		if (data[room]) {
			if (quiz.node) {
				data[room].quiz = {
					node: quiz.node,
					data: {}
				}
			} else {
				// data[room].quiz.data.push(quiz);

				// data[room].quiz.data[quiz.question] = data[room].quiz.data[quiz.question] || {
				// 	question: quiz.question,
				// 	answer: []
				// };
				// var question = data[room].quiz.data[quiz.question];
				// question.answer[quiz.answer] = question.answer[quiz.answer] || [];
				// var answer = question.answer[quiz.answer];
				// answer.push(quiz.user);
				// // console.log(answer)
				// console.log(data[room].quiz.data)

				data[room].quiz.data[quiz.user] = data[room].quiz.data[quiz.user] || [];
				var user = data[room].quiz.data[quiz.user];
				user[quiz.question] = quiz.answer + 1;
				// console.log(user);
			}
		}
	}

	this.save = function(room) {
		// var xml = builder.create("data");	
		// console.log(data[room].pos)
		if (data[room]) {
			var json = JSON.stringify(data[room]);
			var name = room == "" ? "default" : room;
			var dir = config.log_path + data[room].room.owner + "/";
			fs.mkdir(dir, function(err) {
				// if (err) {
				// 	console.log('error' + err);
				// }
				fs.writeFile(dir + name + '.json', json, function(err) {
					if (err) return console.log(err);
					console.log('Save "' + room + '" Data...');
					delete data[room];
				});
			});
		}
	}

	this.load = function(room) {
		var name = room == "" ? "default" : room;
		return fs.readFileSync(config.log_path + name + '.json', 'utf8');
	}

}
var logger = new Logger();

io.sockets.on('connection', function(socket) {

	function getId() {
		return socket.id;
	}

	function loginUser(room, user) {
		socket.join(room);
		logger.logUser(getId(), user);
		socket.set('userName', user.username);

		// console.log("User : '" + user.username + "' join Room : '" + room + "'")
	}

	function logOutUser(room) {
		var users = logger.logData[room].users;
		var clients = io.sockets.clients(room)
		if (clients) {
			for (var i = 0; i < clients.length; i++) {
				clients[i].leave(room);
			}
			logger.save(room);
		}
	}

	socket.on('list:room', function(data, callback) {
		var host = io.sockets.manager.rooms;
		var rooms = [];
		for (var name in host) {
			if (name != "") {
				name = name.slice(1);
				var room = logger.logData[name];
				if (room) {
					rooms.push(room.room);
				}
			}
		}
		callback(rooms);
	});
	socket.on('connect:room', function(data, callback) {
		var name = data.room.name;
		var room = name == "" ? "" : "/" + name;
		if (room in io.sockets.manager.rooms) {
			if (data.exit) {
				socket.leave(data.exit);
			}

			socket.set('roomName', name);

			if (name == "" || name == "/") {
				logger.init(name, data.room);
			}
			loginUser(name, data.user);
			callback(getId());
		}
	});
	socket.on('create:room', function(data) {
		var name = data.room.name;
		socket.set('roomName', name, function() {
			// logger = new Logger();

			logger.init(name, data.room);
			console.log("Create Room : '" + name + "'");

			loginUser(name, data.user);

		});
	});
	socket.on('close:room', function(data, callback) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				logOutUser(room);

				if (callback) {
					callback(logger.getEmails());
				}
			}
		});
	});
	socket.on('disconnect:room', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.get('userName', function(err, user) {
					// console.log("User : " + user + " disconnect");
					socket.leave(room)
					socket.broadcast.to(room).emit('leave:room', getId());
				});
			}
		});
	});
	socket.on('disconnect', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.get('userName', function(err, user) {
					var data = logger.logData[room];
					if (data) {
						var owner = data.room.owner
						if (user == owner) {
							logOutUser(room);
						}

						// console.log("User : " + user + " disconnect");
						socket.leave(room)
						socket.broadcast.to(room).emit('leave:room', getId());
					}
				});
			}
		});
	});

	socket.on('init:pos', function(name) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var data = logger.logData[room];
				if (data) {
					var pos = data.pos[name];
					if (pos) {
						var list = [];
						for (var i = 0; i < pos.length; i++) {
							if (pos[i].user.id != getId()) {
								list.push(pos[i]);
							}
						}
						socket.emit('send:pos', list);
					}
				}

				// console.log(getId() + " Init pos");
			}
		});
	});
	socket.on('send:pos', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				// if (data.pos) {
				// 	console.log("Room : '" + room + "' broadcast pos at ")
				// 	console.log("x : " + data.pos.x + ", y : " + data.pos.y)
				// }
				socket.get('userName', function(err, user) {
					data.user = {
						id: getId(),
						name: user
					};
					socket.broadcast.to(room).emit('send:pos', data);

					logger.logPos(data);
				});
			}

		});

	});
	socket.on('load:pos', function(data, callback) {
		// var pos = require(__dirname + '/log/' + data.room + '.json').pos;
		try {
			var json = logger.load(data.room);
			var pos = JSON.parse(json).pos;

			callback(pos);
		} catch (e) {
			// console.log(e.message);
		}
	});

	socket.on('init:msg', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var data = logger.logData[room];
				if (data) {
					var msg = data.msg
					// console.log("load " + msg);
					socket.emit('send:msg', msg);
				}
				// console.log(getId() + " Init slide");
			}
		});
	});
	socket.on('send:msg', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.broadcast.to(room).emit('send:msg', data.msg);
				socket.get('userName', function(err, user) {
					console.log(user + " save " + data.msg);
					logger.logMsg({
						'emotion': data.msg,
						'user': user
					});
				});
				// console.log("Send msg : " + data.msg);
			}
		});
	});

	socket.on('init:slide', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var data = logger.logData[room];
				if (data) {
					var slide = data.slide;
					socket.emit('send:slide', slide);
				}
				// console.log(getId() + " Init slide");
			}
		});
	});
	socket.on('send:slide', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.broadcast.to(room).emit('send:slide', data);
				// console.log("Send slide : " + data.slide + data.index);

				logger.logSlide(data);
			}
		});
	});

	socket.on('init:quiz', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var data = logger.logData[room];
				if (data) {
					var quiz = data.quiz;
					socket.emit('send:quiz', quiz);
				}
				// console.log(getId() + " Init slide");
			}
		});
	});
	socket.on('send:quiz', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.broadcast.to(room).emit('send:quiz', data);
				// console.log("Send quiz");
				socket.get('userName', function(err, user) {
					data.user = user;
					logger.logQuiz(data);
				});
			}
		});
	});

	socket.on('load:slideshow', function(data, callback) {
		if (data != null) {
			fs.readdir(config.audio_path + data, function(err, files) {
				if (err) throw err;
				var result = {
					path: config.audio,
					n: files.length / 2
				};
				callback(result);
			});
		} else {
			fs.readdir(config.audio_path, function(err, files) {
				if (err) throw err;
				var result = {
					list: []
				};
				var total = files.length;
				files.forEach(function(file, index) {
					fs.lstat(config.audio_path + file, function(err, stats) {
						if (stats.isDirectory()) {
							result.list.push(file);
						}
						if (index >= total - 1) {
							callback(result);
						}
					});

				});
			});
		}
	});
});