'use strict';

module.exports = {
	$id: 'Roles',
	type: 'object',
	properties: {
		id: { type: 'number', unique: true },
		roleName: { type: 'string' },
	},
	required: ['id', 'roleName'],
};
