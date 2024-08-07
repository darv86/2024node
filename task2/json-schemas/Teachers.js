'use strict';

module.exports = {
	$id: 'Teachers',
	type: 'object',
	properties: {
		id: { type: 'number', unique: true },
		name: { type: 'string' },
		middleName: { type: 'string' },
		surname: { type: 'string' },
		role: { $ref: 'Roles' },
	},
	required: ['id', 'name', 'middleName', 'surname', 'role'],
};
