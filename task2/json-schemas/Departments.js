'use strict';

module.exports = {
	$id: 'Departments',
	type: 'object',
	properties: {
		id: { type: 'integer', primaryKey: true, identity: true },
		departmentName: { type: 'string', index: true, notNull: true },
	},
	required: ['id', 'departmentName'],
};
