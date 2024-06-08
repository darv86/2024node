'use strict';

import fs from 'node:fs';
import path from 'node:path';
import pino from 'pino';

class pinoLogger {
	#logger = pino({});

	constructor(logPath) {
		// this.path = logPath;
		// const date = new Date().toISOString().substring(0, 10);
		// const filePath = path.join(logPath, `${date}.log`);
		// this.stream = fs.createWriteStream(filePath, { flags: 'a' });
		// this.regexp = new RegExp(path.dirname(this.path), 'g');
	}

	write(type = 'info', s) {
		const now = new Date().toISOString();
		this.#logger[type](s);
	}

	log(...args) {
		console.log(...args);
		this.write('info', args);
	}

	error(...args) {
		// this.write('error', msg.replace(this.regexp, ''));
	}
}

export default new pinoLogger('../log');
