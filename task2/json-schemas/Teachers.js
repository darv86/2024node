'use strict';

module.exports = {
	$id: 'Teachers',
	// $schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Teachers',
	type: 'object',
	properties: {
		id: { type: 'number' },
		name: { type: 'string' },
		middleName: { type: 'string' },
		surname: { type: 'string' },
		role: { $ref: 'Roles' },
	},
	required: ['id', 'name', 'middleName', 'surname', 'role'],
};
