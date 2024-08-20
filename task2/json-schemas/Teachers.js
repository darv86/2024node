'use strict';

const schemaParts = {
	Teachers: {
		$ref: ['role'],
		primaryKey: ['id'],
		identity: ['id'],
		index: ['surname'],
		notNull: ['middleName'],
	},
};

const columnParts = {
	Teachers: {
		id: '"id" bigint generated always as identity',
		name: '"name" text',
		middleName: '"middleName" text',
		surname: '"surname" text NOT NULL',
		role: '"role" bigint NOT NULL',
	},
};

const clauseParts = {
	Teachers: {
		identity: { id: '' },
		primaryKey: { id: '' },
		index: { surname: '' },
		notNull: { surname: '', role: '' },
		$ref: { role: '' },
	},
};

module.exports = {
	$id: 'Teachers',
	type: 'object',
	properties: {
		id: { type: 'integer', primaryKey: true, identity: true },
		name: { type: 'string' },
		middleName: { type: 'string' },
		surname: { type: 'string', index: true, notNull: true },
		role: { $ref: 'Roles', notNull: true },
	},
	required: ['id', 'name', 'middleName', 'surname', 'role'],
};
