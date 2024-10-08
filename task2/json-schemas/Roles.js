'use strict';

module.exports = {
	$id: 'Roles',
	type: 'object',
	properties: {
		id: { type: 'integer', identity: true, primaryKey: true },
		roleName: { type: 'string', index: true, notNull: true },
	},
	required: ['id', 'roleName'],
};
