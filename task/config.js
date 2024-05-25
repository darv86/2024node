'use strict';

const config = {
	transport: [
		['http', false],
		['ws', true],
	],
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

module.exports = config;
