const express = require('express');

const { createServer } = require('node:http');

const fs = require('fs');

const app = express();

const server = new createServer(app);

const { Server } = require('socket.io');

const io = new Server(server, {
	cors: {
		origin: '*',
	},
	maxHttpBufferSize: 1e7
});

const password = 'Davide2010!';
const port = 50002;

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {

	if (!fs.existsSync(__dirname + '/files'))
		fs.mkdirSync(__dirname + '/files');
	else
		io.to(socket.id).emit('reload list', './',  fs.readdirSync(__dirname + '/files'));

	socket.on('upload files', (path, files_names, files, passwd, callback) => {

		if (password == passwd) {
		
			for (let i = 0; i < files_names.length; i++) {

				fs.writeFileSync(__dirname + '/files/' + path + files_names[i], files[i], (err) => {
				
					if (err) {
					
						callback({status: 'err'});
					}
				});
			}	

			try {

				io.to(socket.id).emit('reload list', './', fs.readdirSync(__dirname + '/files/' + path));
	
			} catch (e) {

				callback({status: 'err'});
			}

			callback({status: 'ok'});
		} else
			callback({status: 'err'});
	});

	socket.on('ask for file', (path, file_name, delete_mode, passwd) => {

		try {

			if (!delete_mode && password == passwd) {

				let file = fs.readFileSync(__dirname + '/files/' + path + file_name, 'base64');

				io.to(socket.id).emit('download file', file_name, Buffer.from(file, 'base64'));
			} else if (password == passwd) {

				fs.unlinkSync(__dirname + '/files/' + path + file_name);

				io.to(socket.id).emit('reload list', path, fs.readdirSync(__dirname + '/files/' + path));
			}

		} catch (e) {

			console.log(e);
		}
	});

	socket.on('refresh', (path) => {

		let error;

		let file_list = fs.readdirSync(__dirname + '/files/' + path, (err) => {

			error = err;
		});

		if (!error)
			io.to(socket.id).emit('reload list', path, file_list);
	});

	socket.on('make directory', (path, name_dir, passwd) => {

		try {
			if (password == passwd)
				fs.mkdirSync(__dirname + '/files/' + path + name_dir);
			io.to(socket.id).emit('reload list', path, fs.readdirSync(__dirname + '/files/' + path));
		} catch (e) {
			console.log(e);
		}
	});

	socket.on('delete directory', (path, name_dir, passwd) => {

		try {
			fs.rmdirSync(__dirname + '/files/' + path + name_dir);
		} catch (e) {
			console.log(e);
		}
	});
});

server.listen(port, () => {

	console.log('Go to localhost:' + (port));
});
