'use strict';

module.exports = {
	$id: 'Subjects',
	type: 'object',
	properties: {
		id: { type: 'integer', identity: true },
		subjectName: { type: 'string', index: true, notNull: true },
		role: { $ref: 'Roles', notNull: true },
	},
	required: ['id', 'subjectName', 'role'],
};
