const err_message1_text = 'Il caricamento dei file non è andato a buon fine.'
const success_message1_text = 'Il caricamento dei file è andato a buon fine.';

const err_message2_text = 'Lo/a scarimento/eliminazione dei file selezionati non è andato/a a buon fine.';
const success_message2_text = 'Lo/a scarimento/eliminazione dei file selezionati è andato/a a buon fine.';

const success_color = 'rgb(0, 100, 0)';
const error_color = 'rgb(166, 54, 54)';
const overmouse_color = 'rgb(174, 52, 151)';
const selected_color = 'Tomato';

const message_time = 2000;

const socket = io();

const password = document.getElementById('password');
const input = document.getElementById('input_file');
const err_message = document.getElementById('error');
const uninstall = document.getElementById('uninstall');
const folder_name = document.getElementById('folder_name');
const button_folder = document.getElementById('button_folder');
const button_path = document.getElementById('button_path');
const button_delete = document.getElementById('button_delete');

let list = document.getElementById('list');

let delete_mode = false;

let path = '';

uninstall.addEventListener('click', () => {

	delete_mode = uninstall.checked;
});

input.addEventListener('change', (event) => {
	
	const files = event.target.files;

	let names = [];

	for (let i = 0; i < files.length; i++) {

		names.push(files[i].name);
	}

	socket.timeout(5000).emit('upload files', path, names, files, password.value, (err, response) => {
		
		if (err || response.status == 'err') {

			err_message.style.color = error_color;
			err_message.innerHTML = err_message1_text;
			err_message.style.display = 'block';

		} else if (response.status == 'ok') {

			err_message.style.color = success_color;
			err_message.innerHTML = success_message1_text;
			err_message.style.display = 'block';

		}

		setTimeout(() => {

			err_message.style.display = 'none';

		}, message_time);

		input.value = '';
	});
});

button_folder.addEventListener('click', () => {

	socket.emit('make directory', path, folder_name.value, password.value);
	folder_name.value = '';
});

button_path.addEventListener('click', () => {

	if (folder_name.value != '')
		socket.emit('refresh', path + folder_name.value + '/');
		folder_name.value = '';
});

button_delete.addEventListener('click', () => {

	socket.emit('delete directory', path, folder_name.value, password.value);
	location.reload();
});

socket.on('download file', (file_name, file) => {

	let blob = new Blob([file]);

	const a = document.createElement('a');

	a.href = URL.createObjectURL(blob);

	a.download = file_name;

	document.body.appendChild(a);

	a.click();

	document.body.removeChild(a);
}); 

socket.on('reload list', (p, file_list) => {

	path = p;
	console.log(path);

	list.innerHTML = '';

	let item;

	for (let i = 0; i < file_list.length; i++) {

		item = document.createElement('li');

		item.innerHTML = `${file_list[i]}`;

		item.addEventListener('mouseover', (event) => {

			event.target.style.color = overmouse_color;
		});

		item.addEventListener('mouseout', (event) => {

			event.target.style.color = 'black';
		});

		item.addEventListener('click', (event) => {

			event.target.style.color = selected_color;
			
			socket.timeout(5000).emit('ask for file', path, file_list[i], delete_mode, password.value);

			setTimeout(() => {

				err_message.style.display = 'none';

				event.target.style.color = 'black';

			}, message_time);
		});

		list.appendChild(item);
	}
});
