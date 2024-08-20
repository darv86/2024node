'use strict';

const fsp = require('node:fs/promises');
const path = require('node:path');
const eol = require('node:os').EOL;

const SCHEMAS = path.join(process.cwd(), '../json-schemas');

async function getSchemasArr() {
	const schemaNames = await fsp.readdir(SCHEMAS);
	const schemaFiles = [];
	for (const name of schemaNames) schemaFiles.push(require(path.join(SCHEMAS, name)));
	return schemaFiles;
}

class StructureBuilder {
	#sqlTypes = {
		integer: 'bigint',
		number: 'numeric(10,2)',
		string: 'text',
		boolean: 'boolean',
	};

	#keywords = ['identity', 'primaryKey', '$ref', 'index', 'notNull'];

	#schemaParts = {};
	#columnParts = {};
	#clauseParts = {};

	constructor(schemas) {
		this.schemas = schemas;
	}

	#takeSchemaParts() {
		for (const schema of this.schemas) {
			const columns = schema.properties;
			this.#schemaParts[schema.$id] = this.#schemaParts[schema.$id] ?? {};
			for (const columnName of Object.keys(columns)) {
				for (const keyword of this.#keywords) {
					const schemaWithParts = this.#schemaParts[schema.$id];
					if (keyword in columns[columnName]) {
						schemaWithParts[keyword] = schemaWithParts[keyword] ?? [];
						schemaWithParts[keyword].push(columnName);
					}
				}
			}
		}
		// console.dir({ schemaParts: this.#schemaParts }, { depth: null });
		return this;
	}

	#takeColumnParts() {
		for (const schema of this.schemas) {
			const columns = schema.properties;
			this.#columnParts[schema.$id] = this.#columnParts[schema.$id] ?? {};
			for (const columnName of Object.keys(columns)) {
				this.#columnParts[schema.$id][columnName] = `"${columnName}" ${
					this.#sqlTypes[columns[columnName].type] ?? this.#sqlTypes.integer
				}${
					this.#schemaParts[schema.$id].notNull?.includes(columnName) ? ' NOT NULL' : ''
				};${eol}`;
			}
		}
		// console.dir({ columnParts: this.#columnParts }, { depth: null });
		return this;
	}

	#takeClauseParts() {
		for (const schemaName of Object.keys(this.#schemaParts)) {
			this.#clauseParts[schemaName] = this.#clauseParts[schemaName] ?? {};
			for (const keyword of Object.keys(this.#schemaParts[schemaName])) {
				this.#clauseParts[schemaName][keyword] =
					this.#clauseParts[schemaName][keyword] ?? {};
				for (const column of this.#schemaParts[schemaName][keyword]) {
					this.#clauseParts[schemaName][keyword][column] =
						this.#clauseParts[schemaName][keyword][column] ?? {};
					this.#clauseParts[schemaName][keyword][column] = ``;
				}
			}
		}
		console.dir({ clauseParts: this.#clauseParts }, { depth: null });
		return this;
	}

	// #keywords = {
	// 	identity: `generated always as identity`,
	// 	primaryKey: `ALTER TABLE "${schema.$id}" ADD CONSTRAINT "pk${schema.$id}" PRIMARY KEY ("accountId");`,
	// 	$ref: `ALTER TABLE "${schema.$id}" ADD CONSTRAINT "fk${
	// 		schema.$id + column.$ref
	// 	}" FOREIGN KEY ("id") REFERENCES "${column.$ref}" ("id");`,
	// 	index: `CREATE UNIQUE INDEX "ak${schema.$id}" ON "${schema.$id}" ("login);`,
	// 	notNull: `NOT NULL`,
	// };

	build() {
		this.#takeSchemaParts().#takeColumnParts().#takeClauseParts();
	}
}

(async () => {
	const schemas = await getSchemasArr();
	const structure = new StructureBuilder(schemas);
	structure.build();
})();

module.exports = { StructureBuilder };
