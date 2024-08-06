'use strict';

module.exports = {
	$id: 'Roles',
	// $schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Roles',
	type: 'object',
	properties: {
		id: { type: 'number' },
		role: { type: 'string' },
	},
	required: ['id', 'role'],
};
