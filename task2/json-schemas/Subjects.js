'use strict';

module.exports = {
	$id: 'Subjects',
	type: 'object',
	properties: {
		id: { type: 'number', unique: true },
		subjectName: { type: 'string' },
		role: { $ref: 'Roles' },
	},
	required: ['id', 'subjectName', 'role'],
};
