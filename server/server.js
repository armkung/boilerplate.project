var io = require('socket.io').listen(8080);
var fs = require('fs');
var md = require('./module/module.js');
md.test()
// var builder = require('xmlbuilder');

io.set('log level', 1);

var Logger = function() {
	var data = {};

	this.logData = data;
	this.init = function(room) {
		// if (!(room in data)) {
		data[room] = {
			users: {},
			msgs: [],
			pos: []
		};
		// }
	}
	this.logUser = function(room, id, user) {
		// var usersRoom = data[room].users;
		// if (usersRoom.indexOf(user) == -1) {
		// 	usersRoom.push(user);
		// }
		if (data[room]) {
			data[room].users[user] = id;
		}
	}
	this.logMsg = function(room, msg) {
		if (data[room]) {
			data[room].msgs.push(msg);
		}
	}

	this.logPos = function(room, pos) {
		// var n = data[room].pos.length;
		// n = (n == 0) ? 0 : n - 1;
		// if (pos.isSeed) {
		// 	data[room].pos[n] = [];
		// } else {
		// 	data[room].pos[n].push(pos);
		// }
		// console.log(data[room].pos)
		if (data[room]) {
			data[room].pos.push(pos);
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
				console.log('Save Data...');
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
		logger.logUser(room, getId(), user);
		socket.set('userName', user);

		console.log("User : '" + user + "' join Room : '" + room + "'")
	}
	socket.on('list:room', function(data, callback) {
		var host = io.sockets.manager.rooms;
		var rooms = [];
		for (var name in host) {
			if (name != "") {
				rooms.push(name.slice(1));
			}
		}
		callback(rooms);
	});
	socket.on('connect:room', function(data, callback) {
		var room = data.room == "" ? "" : "/" + data.room;
		if (room in io.sockets.manager.rooms) {
			socket.set('roomName', data.room);

			if (data.room == "" || data.room == "/") {
				logger.init(data.room);
			}
			loginUser(data.room, data.user);
			callback(getId());
		}
	});
	socket.on('create:room', function(data) {
		socket.set('roomName', data.room, function() {

			logger.init(data.room);
			console.log("Create Room : '" + data.room + "'");

			loginUser(data.room, data.user);

		});
	});
	socket.on('close:room', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				var clients = io.sockets.clients(room)
				if (clients) {
					for (var i = 0; i < clients.length; i++) {
						clients[i].disconnect();
					}
					logger.save(room);
				}
			}
		});
	});
	socket.on('leave:room', function() {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				socket.get('userName', function(err, user) {
					console.log("User : " + user + " disconnect");
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
					console.log("User : " + user + " disconnect");
					socket.leave(room)
					socket.broadcast.to(room).emit('leave:room', getId());
				});
			}
		});
	});

	socket.on('send:pos', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				if (data.pos) {
					console.log("Room : '" + room + "' broadcast pos at ")
					console.log("x : " + data.pos.x + ", y : " + data.pos.y)
				}
				logger.logPos(room, data.pos);

				data.id = getId();
				socket.broadcast.to(room).emit('send:pos', data);
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

	// socket.on('send:text', function(data) {
	// 	socket.get('roomName', function(err, room) {
	// 		if (room != null) {
	// 			data.id = getId();
	// 			socket.broadcast.to(room).emit('send:text', data);
	// 			console.log("Send text : " + data.pos.text)
	// 		}
	// 	});

	// });

	socket.on('send:msg', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				io.sockets. in (room).emit('send:msg', data.msg);
				logger.logMsg(room, data.msg);
				console.log("Send msg : " + data.msg);
			}
		});
	});

	socket.on('send:slide', function(data) {
		socket.get('roomName', function(err, room) {
			if (room != null) {
				io.sockets. in (room).emit('send:slide', data);
				console.log("Send slide : " + data.url + data.index);
			}
		});
	});
});