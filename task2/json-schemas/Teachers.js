'use strict';

module.exports = {
	$id: 'Teachers',
	type: 'object',
	properties: {
		id: { type: 'integer', primaryKey: true, identity: true },
		name: { type: 'string' },
		middleName: { type: 'string' },
		surname: { type: 'string', index: true, notNull: true },
		role: { $ref: 'Roles', notNull: true },
		subject: { $ref: 'Subjects', notNull: true },
		department: { $ref: 'Departments', notNull: true },
	},
	required: ['id', 'name', 'middleName', 'surname', 'role', 'department'],
};
