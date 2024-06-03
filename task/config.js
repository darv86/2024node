'use strict';

export default {
	transport: { http: true, ws: false },
	staticFilesPath: './static',
	port: {
		static: 8000,
		dynamic: 8001,
	},
	dbParams: {
		host: '127.0.0.1',
		port: 5432,
		database: 'example',
		user: 'marcus',
		password: 'marcus',
	},
};
