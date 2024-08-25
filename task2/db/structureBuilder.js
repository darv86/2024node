'use strict';

const fsp = require('node:fs/promises');
const eol = require('node:os').EOL;

module.exports = class StructureBuilder {
	#sqlTypes = {
		integer: ' bigint',
		number: ' numeric(10,2)',
		string: ' text',
		boolean: ' boolean',
	};

	#columnOpts = {
		identity: ' generated always as identity',
		notNull: ' NOT NULL',
	};

	#clauses = ['primaryKey', '$ref', 'index'];

	#columnParts = {};
	#clauseParts = {};

	constructor(schemas, url) {
		this.schemas = schemas;
		this.url = url;
	}

	#takeColumnParts() {
		this.#columnParts = this.schemas.reduce((struct, schema) => {
			struct[schema.$id] = {};
			const columns = schema.properties;
			const columnsName = Object.keys(columns);
			columnsName.map(col => (struct[schema.$id][col] = ''));
			for (const [col, val] of Object.entries(columns)) {
				let desc = `"${col}"`;
				desc += 'type' in val ? this.#sqlTypes[columns[col].type] : this.#sqlTypes.integer;
				for (const opt of Object.keys(this.#columnOpts)) {
					if (opt in val) desc += this.#columnOpts[opt];
					struct[schema.$id][col] = desc;
					// struct[schema.$id][col] = desc + ',';
				}
			}
			return struct;
		}, {});
		// console.dir(this.#columnParts, { depth: null });
		return this;
	}

	#takeClauseParts() {
		this.#clauseParts = this.schemas.reduce((struct, schema) => {
			struct[schema.$id] = {};
			const columns = schema.properties;
			for (const [col, val] of Object.entries(columns)) {
				for (const clauseName of this.#clauses) {
					if (clauseName in val) {
						struct[schema.$id][clauseName] = struct[schema.$id][clauseName] ?? {};
						struct[schema.$id][clauseName][col] = this.#getClause({
							schemaName: schema.$id,
							column: col,
							keyword: clauseName,
						});
					}
				}
			}
			return struct;
		}, {});
		// console.dir(this.#clauseParts, { depth: null });
		return this;
	}

	#getClause({ schemaName = '', column = '', keyword = '' }) {
		const schema = this.schemas.find(schema => schema.$id === schemaName);
		const schemaNameRef = schema?.properties[column]?.$ref;
		const schemaRef = this.schemas.find(schema => schema.$id === schemaNameRef);
		const columnNameRef =
			schemaRef?.properties && Object.entries(schemaRef?.properties).find(([col, val]) => 'identity' in val)[0];
		const clauses = {
			primaryKey: `ALTER TABLE "${schemaName}" ADD CONSTRAINT "pk${schemaName}" PRIMARY KEY ("${column}");`,
			$ref: `ALTER TABLE "${schemaName}" ADD CONSTRAINT "fk${
				schemaName + schemaNameRef
			}" FOREIGN KEY ("${column}") REFERENCES "${schemaNameRef}" ("${columnNameRef}");`,
			index: `CREATE UNIQUE INDEX "ak${schemaName}" ON "${schemaName}" ("${column}");`,
		};
		const clause = clauses[keyword];
		if (clause) return clause;
	}

	#getAllClauses(obj) {
		let values = [];
		function extractValues(item) {
			if (typeof item === 'object') Object.values(item).map(extractValues);
			else values.push(item);
		}
		extractValues(obj);
		return values;
	}

	#createSql() {
		const schemasName = this.schemas.map(schema => schema.$id);
		let query = '';
		for (const schemaName of schemasName) {
			query += `CREATE TABLE "${schemaName}" (${eol}`;
			Object.values(this.#columnParts[schemaName]).map(
				(val, i, arr) => (query += '  ' + val + (i < arr.length - 1 ? ',' : '') + eol)
			);
			query += ');' + eol + eol;
			Object.values(this.#clauseParts[schemaName]).map(val => {
				const clauses = this.#getAllClauses(val);
				query += clauses.join(eol) + eol;
			});
			query += eol;
		}
		return query;
	}

	async build() {
		const data = this.#takeClauseParts().#takeColumnParts().#createSql();
		await fsp.writeFile(this.url, data);
	}
};
