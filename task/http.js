// @ts-nocheck
'use strict';

import http from 'node:http';

const HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type',
	// 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const parseBody = async req => {
	const buffers = [];
	for await (const chunk of req) buffers.push(chunk);
	const data = Buffer.concat(buffers).toString();
	return data ? JSON.parse(data) : [];
};

export default (routing, port) => {
	http.createServer(async (req, res) => {
		res.writeHead(200, HEADERS);
		if (req.method !== 'POST') return void res.end('"Not found"');
		const { url, socket } = req;
		const [name, method, id] = url.substring(1).split('/');
		const entity = routing[name];
		if (!entity) return void res.end('Not found');
		const handler = entity[method];
		if (!handler) return void res.end('Not found');
		const src = handler.toString();
		const signature = src.substring(0, src.indexOf(')'));
		const body = await parseBody(req);
		console.log(`${socket.remoteAddress} ${method} ${url}`);
		const result = await handler(...body);
		res.end(JSON.stringify(result.rows));
	}).listen(port);

	console.log(`HTTP API on port ${port}`);
};
