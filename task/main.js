// @ts-nocheck
'use strict';

import fsp from 'node:fs/promises';
import path from 'node:path';
import config from './config.js';
import staticServer from './static.js';
import db from './db.js';
import hash from './hash.js';
import logger from './logger.js';

const { transport, staticFilesPath, port } = config;
const serverPath = `./${Object.entries(transport).find(type => type[1])[0]}.js`;
const sandbox = {
	console: Object.freeze(logger),
	db: Object.freeze(db),
	common: { hash },
};
const apiPath = path.join(process.cwd(), './api');
const apiUrl = new URL('./api/', import.meta.url);
const routing = {};

(async () => {
	const files = await fsp.readdir(apiPath);
	for (const fileName of files) {
		if (!fileName.endsWith('.js')) continue;
		const filePath = new URL(fileName, apiUrl);
		const serviceName = path.basename(fileName, '.js');
		const serviceHandler = (await import(filePath)).default;
		routing[serviceName] = serviceHandler(sandbox);
	}
	const server = (await import(serverPath)).default;
	staticServer(staticFilesPath, port.static);
	server(routing, port.dynamic);
})();
