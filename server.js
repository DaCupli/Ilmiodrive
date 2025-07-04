const express = require('express');

const { createServer } = require('node:http');

const fs = require('fs');

const app = express();

const server = new createServer(app);

const { Server } = require('socket.io');

const io = new Server(server, {
	cors: {
		origin: '*',
	}
});

const port = 50002;

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {

	io.to(socket.id).emit('reload list', fs.readdirSync(__dirname + '/files'));

	socket.on('upload files', (files_names, files, callback) => {
		
		for (let i = 0; i < files_names.length; i++) {

			fs.writeFileSync(__dirname + '/files/' + files_names[i], files[i], (err) => {
				
				if (err) {
					
					callback({status: 'err'});
				}
			});
		}	

		callback({status: 'ok'});

		io.to(socket.id).emit('reload list', fs.readdirSync(__dirname + '/files'));
	});

	socket.on('ask for file', (file_name, delete_mode) => {

		console.log(delete_mode);

		try {

			if (!delete_mode) {

				let file = fs.readFileSync(__dirname + '/files/' + file_name, 'base64');

				io.to(socket.id).emit('download file', file_name, Buffer.from(file, 'base64'));
			} else {

				fs.unlinkSync(__dirname + '/files/' + file_name);

				io.to(socket.id).emit('reload list', fs.readdirSync(__dirname + '/files'));
			}

		} catch (e) {

			console.log(e);
		}
	});
});

server.listen(port, () => {

	console.log('Go to localhost:' + (port));
});
