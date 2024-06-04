// @ts-nocheck
'use strict';

// const socket = new WebSocket('ws://127.0.0.1:8001/');

// function scaffold(url, structure) {
// 	const socket = new WebSocket(url);
// 	const api = {};
// 	const services = Object.keys(structure);
// 	for (const serviceName of services) {
// 		api[serviceName] = {};
// 		const service = structure[serviceName];
// 		const methods = Object.keys(service);
// 		for (const methodName of methods) {
// 			api[serviceName][methodName] = (...args) =>
// 				new Promise(resolve => {
// 					const packet = { name: serviceName, method: methodName, args };
// 					socket.send(JSON.stringify(packet));
// 					socket.onmessage = event => {
// 						const data = JSON.parse(event.data);
// 						resolve(data);
// 					};
// 				});
// 		}
// 	}
// 	return { api, socket };
// }

function scaffold(url, structure) {
	const api = {};
	const services = Object.keys(structure);
	for (const serviceName of services) {
		api[serviceName] = {};
		const service = structure[serviceName];
		const methods = Object.keys(service);
		for (const methodName of methods) {
			api[serviceName][methodName] = async (...args) => {
				try {
					const [id] = args;
					const urlfetch = `${url}${serviceName}/${methodName}/${id}`;
					const response = await fetch(urlfetch, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(args),
					});
					return await response.json();
				} catch (e) {
					console.log(e);
				}
			};
		}
	}
	return api;
}

// const { api, socket } = scaffold('ws://127.0.0.1:8001/', {
const api = scaffold('http://127.0.0.1:8001/', {
	user: {
		create: ['record'],
		read: ['id'],
		update: ['id', 'record'],
		delete: ['id'],
		find: ['mask'],
	},
	country: {
		read: ['id'],
		delete: ['id'],
		find: ['mask'],
	},
});

// socket.addEventListener('open', async () => {
// 	const data = await api.user.read(3);
// 	console.dir({ data });
// });

(async () => {
	console.log(await api.user.read(3));
})();
