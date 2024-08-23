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

	#columnOpts = {};

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

	#getClause({ schemaName = '', column = '', keyword = '' }) {
		const schema = this.schemas.find(schema => schema.$id === schemaName);
		const schemaNameRef = schema?.properties[column]?.$ref;
		const columnRef = this.#schemaParts[schemaNameRef]?.identity[0];
		const clause = {
			identity: ` generated always as identity`,
			primaryKey: `ALTER TABLE "${schemaName}" ADD CONSTRAINT "pk${schemaName}" PRIMARY KEY ("${column}");`,
			$ref: `ALTER TABLE "${schemaName}" ADD CONSTRAINT "fk${
				schemaName + schemaNameRef
			}" FOREIGN KEY ("${column}") REFERENCES "${schemaNameRef}" ("${columnRef}");`,
			index: `CREATE UNIQUE INDEX "ak${schemaName}" ON "${schemaName}" ("${column}");`,
			notNull: ` NOT NULL`,
		};
		return clause[keyword];
	}

	#takeClauseParts() {
		for (const schemaName of Object.keys(this.#schemaParts)) {
			this.#clauseParts[schemaName] = this.#clauseParts[schemaName] ?? {};
			for (const keyword of Object.keys(this.#schemaParts[schemaName])) {
				this.#clauseParts[schemaName][keyword] = this.#clauseParts[schemaName][keyword] ?? {};
				for (const column of this.#schemaParts[schemaName][keyword]) {
					this.#clauseParts[schemaName][keyword][column] =
						this.#clauseParts[schemaName][keyword][column] ?? {};
					this.#clauseParts[schemaName][keyword][column] = this.#getClause({
						schemaName,
						column,
						keyword,
					});
				}
			}
		}
		// console.dir({ clauseParts: this.#clauseParts }, { depth: null });
		// console.dir({ schemas: this.schemas }, { depth: null });
		return this;
	}

	#takeColumnParts() {
		for (const schemaName of Object.keys(this.#schemaParts)) {
			const columns = this.schemas.find(schema => schema.$id === schemaName).properties;
			this.#columnParts[schemaName] = this.#columnParts[schemaName] ?? {};
			for (const columnName of Object.keys(columns)) {
				const sqlType = this.#sqlTypes[columns[columnName].type] ?? this.#sqlTypes.integer;
				for (const keyword of Object.keys(this.#schemaParts[schemaName])) {
					const keywordHasColumn = this.#schemaParts[schemaName][keyword].includes(columnName) ? keyword : '';
					const clause = this.#getClause({ keyword: keywordHasColumn });
					this.#columnParts[schemaName][columnName] = this.#columnParts[schemaName][columnName] ?? '';
					this.#columnParts[schemaName][columnName] += sqlType + clause;
					// this.#columnParts[schemaName][columnName] = `"${columnName}" ${sqlType}${clause};`;
				}
			}
		}
		console.dir({ columnParts: this.#columnParts }, { depth: null });
		return this;
	}

	build() {
		this.#takeSchemaParts().#takeClauseParts().#takeColumnParts();
	}
}

(async () => {
	const schemas = await getSchemasArr();
	const structure = new StructureBuilder(schemas);
	structure.build();
})();

module.exports = { StructureBuilder };
