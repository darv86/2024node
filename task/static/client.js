// @ts-nocheck
'use strict';

const API_URL = 'http://127.0.0.1:8001/';

const transport = {
	http(url, serviceName, methodName) {
		return (...args) =>
			new Promise((resolve, reject) => {
				// const [params] = args;
				// const urlfetch = `${url}${serviceName}/${methodName}/${params || ''}`;
				const urlfetch = `${url}${serviceName}/${methodName}/`;
				fetch(urlfetch, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(args),
				}).then(response => {
					if (response.status === 200) resolve(response.json());
					else reject(new Error(`Status Code: ${response.status}`));
				});
			});
	},
	ws(url, serviceName, methodName) {
		return (...args) =>
			new Promise(resolve => {
				const packet = { name: serviceName, method: methodName, args };
				socket.send(JSON.stringify(packet));
				socket.addEventListener('message', event => {
					const data = JSON.parse(event.data);
					resolve(data);
				});
			});
	},
};

function scaffold(url, structure) {
	const api = {};
	const services = Object.keys(structure);
	const protocol = url.split(':')[0];
	const socket = protocol === 'ws' && new WebSocket(url);
	for (const serviceName of services) {
		api[serviceName] = {};
		const service = structure[serviceName];
		const methods = Object.keys(service);
		for (const methodName of methods) {
			api[serviceName][methodName] = transport[protocol](url, serviceName, methodName);
		}
	}
	return { api, socket };
}

const { api, socket } = scaffold(API_URL, {
	user: {
		create: ['record'],
		read: ['id'],
		update: ['id', 'record'],
		delete: ['id'],
		find: ['mask'],
	},
	session: {
		create: ['record'],
		read: ['id'],
		update: ['id', 'record'],
		delete: ['id'],
		find: ['mask'],
	},
	country: {
		create: ['record'],
		read: ['id'],
		delete: ['id'],
		find: ['mask'],
	},
});

socket
	? socket.addEventListener('open', async () => {
			console.log(await api.user.read(3));
	  })
	: (async () => {
			console.log(await api.user.read(3));
	  })();
