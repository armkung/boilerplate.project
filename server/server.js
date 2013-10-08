var io = require('socket.io').listen(8080);
var fs = require('fs');
var md = require('./module/module.js');
md.test()
// var builder = require('xmlbuilder');

io.set('log level', 1);

var Logger = function() {
	var data = {};
	var socket;
	this.init = function(sc, room) {
		// if (!(room in data)) {
		data = {
			room: room,
			users: {},
			msgs: [],
			pos: []
		};
		socket = sc;
		socket.set("data", data);
		// }
	}
	this.getData = function(callback) {
		if (socket) {
			socket.get("data", callback);
		}
	}
	this.logUser = function(id, user) {
		// var usersRoom = data[room].users;
		// if (usersRoom.indexOf(user) == -1) {
		// 	usersRoom.push(user);
		// }

		data.users[user] = id;

	}
	this.logMsg = function(msg) {

		data.msgs.push(msg);

	}

	this.logPos = function(pos) {
		// var n = data[room].pos.length;
		// n = (n == 0) ? 0 : n - 1;
		// if (pos.isSeed) {
		// 	data[room].pos[n] = [];
		// } else {
		// 	data[room].pos[n].push(pos);
		// }
		// console.log(data[room].pos)

		data.pos.push(pos);

	}

	this.save = function() {
		// var xml = builder.create("data");	
		// console.log(data[room].pos)

		var json = JSON.stringify(data);
		var room = data.room;
		var name = room == "" ? "default" : room;
		fs.writeFile(__dirname + '/log/' + name + '.json', json, function(err) {
			if (err) return console.log(err);
			console.log('Save Data...');
			delete data[room];
		});

	}

	// this.load = function(room) {
	// 	var name = room == "" ? "default" : room;
	// 	return fs.readFileSync(__dirname + '/log/' + name + '.json', 'utf8');
	// }

}
var logger = new Logger();

io.sockets.on('connection', function(socket) {

	function getId() {
		return socket.id;
	}

	function loginUser(room, user) {
		socket.set('userName', user);
		socket.join(room);
		logger.logUser(getId(), user);

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
			if (data.room == "" || data.room == "/") {
				logger.init(socket, data.room);
			}
			loginUser(data.room, data.user);
			callback(getId());
		}
	});
	socket.on('create:room', function(data) {
		logger.init(socket, data.room);
		console.log("Create Room : '" + data.room + "'");

		loginUser(data.room, data.user);
	});
	socket.on('close:room', function() {
		logger.getData(function(err, data) {
			if (data != null) {
				var room = data.room;
				var clients = io.sockets.clients(room)
				if (clients) {
					for (var i = 0; i < clients.length; i++) {
						clients[i].disconnect();
					}
					logger.save();
				}
			}
		});
	});
	socket.on('leave:room', function() {
		logger.getData(function(err, data) {
			if (data != null) {
				var room = data.room;
				socket.get('userName', function(err, user) {
					console.log("User : " + user + " disconnect");
					socket.leave(room)
					socket.broadcast.to(room).emit('leave:room', getId());
				});
			}
		});
	});
	socket.on('disconnect', function() {
		logger.getData(function(err, data) {
			if (data != null) {
				var room = data.room;
				socket.get('userName', function(err, user) {
					console.log("User : " + user + " disconnect");
					socket.leave(room)
					socket.broadcast.to(room).emit('leave:room', getId());
				});
			}
		});
	});
	socket.on('init:pos', function() {
		logger.getData(function(err, data) {
			if (data != null) {
				var room = data.room;
				var pos = data.pos;
				for (var i = 0; i < pos.length; i++) {
					if (pos[i].user.id != getId()) {
						socket.emit('send:pos', pos[i]);
					}
				};
			}
		});
	});
	socket.on('send:pos', function(obj) {
		logger.getData(function(err, data) {
			if (data != null) {
				var room = data.room;
				if (obj.pos) {
					console.log("Room : '" + room + "' broadcast pos at ")
					console.log("x : " + obj.pos.x + ", y : " + obj.pos.y)
				}
				socket.get('userName', function(err, user) {
					obj.user = {
						id: getId(),
						name: user
					};
					socket.broadcast.to(room).emit('send:pos', obj);

					logger.logPos(obj);
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


	socket.on('send:msg', function(obj) {
		logger.getData(function(err, data) {
			var room = data.room;
			if (room != null) {
				io.sockets. in (room).emit('send:msg', obj.msg);
				logger.logMsg(obj.msg);
				console.log("Send msg : " + obj.msg);
			}
		});
	});

	socket.on('send:slide', function(obj) {
		logger.getData(function(err, data) {
			var room = data.room;
			if (room != null) {
				io.sockets. in (room).emit('send:slide', obj);
				console.log("Send slide : " + obj.url + obj.index);
			}
		});
	});
});