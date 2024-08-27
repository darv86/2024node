'use strict';

const transport = {};

transport.ws = url => structure => {
	const socket = new WebSocket(url);
	const api = {};
	const services = Object.keys(structure);
	for (const name of services) {
		api[name] = {};
		const service = structure[name];
		const methods = Object.keys(service);
		for (const method of methods) {
			api[name][method] = (...args) =>
				new Promise(resolve => {
					const packet = { name, method, args };
					socket.send(JSON.stringify(packet));
					socket.onmessage = event => {
						const data = JSON.parse(event.data);
						resolve(data);
					};
				});
		}
	}
	return new Promise(resolve => {
		socket.addEventListener('open', () => resolve(api));
	});
};

transport.http = url => structure => {
	const api = {};
	const services = Object.keys(structure);
	for (const name of services) {
		api[name] = {};
		const service = structure[name];
		const methods = Object.keys(service);
		for (const method of methods) {
			api[name][method] = (...args) =>
				new Promise((resolve, reject) => {
					fetch(`${url}/api/${name}/${method}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(...args),
					}).then(res => {
						if (res.status === 200) resolve(res.json());
						else reject(new Error(`Status Code: ${res.status}`));
					});
				});
		}
	}
	return Promise.resolve(api);
};

const scaffold = url => {
	const protocol = url.startsWith('ws:') ? 'ws' : 'http';
	return transport[protocol](url);
};

(async () => {
	const api = await scaffold('http://localhost:8001')({
		auth: {
			signin: ['login', 'password'],
			signout: [],
			restore: ['token'],
		},
		messenger: {
			sendMsg: ['msg', 'addressee'],
			deleteMsg: ['msg'],
			method: ['arg'],
		},
		university: {
			addTeacher: ['id', 'nama', 'middleName', 'surname', 'role', 'subject', 'department'],
			removeTeacher: ['id'],
			changeRole: ['id', 'role'],
			changeSubject: ['id', 'subject'],
			changeDepartment: ['id', 'department'],
		},
	});
	const data = await api.auth.signin({ login: 'marcus', password: 'marcus' });
	const teacher = await api.university.addTeacher({
		id: 1,
		name: 'marc',
		middleName: 'marcus',
		surname: 'marcusIII',
		role: 2,
		subject: 3,
		department: 1,
	});
	console.dir({ data, teacher });
})();
