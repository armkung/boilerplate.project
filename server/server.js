var io = require('socket.io').listen(8080);
var fs = require('fs');
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
				msgs: [],
				pos: []
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
				id: id,
				email: user.email
			}
		}
	}
	this.logMsg = function(msg) {
		if (data[room]) {
			data[room].msgs.push(msg);
		}
	}

	this.logPos = function(pos) {
		if (data[room]) {
			data[room].pos.push(pos);
		}
	}

	this.logSlide = function(slide) {
		if (data[room]) {
			data[room].slide = slide;
		}
	}

	this.save = function(room) {
		// var xml = builder.create("data");	
		// console.log(data[room].pos)
		if (data[room]) {
			var json = JSON.stringify(data[room]);
			var name = room == "" ? "default" : room;
			fs.writeFile(__dirname + '/log/' + name + '.json', json, function(err) {
				if (err) return console.log(err);
				console.log('Save "' + room + '" Data...');
				delete data[room];
			});
		}
	}

	this.load = function(room) {
		var name = room == "" ? "default" : room;
		return fs.readFileSync(__dirname + '/log/' + name + '.json', 'utf8');
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

		function getUserName(id) {
			for (name in users) {
				if (users[name].id == id) {
					return name;
				}
			}
			return "";
		}
		var clients = io.sockets.clients(room)
		if (clients) {
			for (var i = 0; i < clients.length; i++) {
				var name = getUserName(clients[i].id);
				socket.set('userName', name);
				clients[i].disconnect();
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
					var owner = logger.logData[room].room.owner;
					if (user == owner) {
						logOutUser(room);
					}

					// console.log("User : " + user + " disconnect");
					socket.leave(room)
					socket.broadcast.to(room).emit('leave:room', getId());

				});
			}
		});
	});

	socket.on('init:pos', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var pos = logger.logData[room].pos;
				for (var i = 0; i < pos.length; i++) {
					if (pos[i].user.id != getId()) {
						socket.emit('send:pos', pos[i]);
					}
				};

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

	socket.on('send:msg', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				io.sockets. in (room).emit('send:msg', data.msg);
				logger.logMsg(data.msg);

				// console.log("Send msg : " + data.msg);
			}
		});
	});

	socket.on('init:slide', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var slide = logger.logData[room].slide;
				socket.emit('send:slide', slide);
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

	socket.on('send:quiz', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.broadcast.to(room).emit('send:quiz', data);
				console.log("Send quiz");
			}
		});
	});
});