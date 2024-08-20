'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const pg = require('pg');
const config = require('./config.js');
const Ajv = require('ajv/dist/2019');
const os = require('node:os');

const DB = path.join(process.cwd(), './db');
const SCHEMAS = path.join(process.cwd(), './json-schemas');

(async () => {
	// await cleanDb();
	createStructure(await getSchemasArr(), 'hi');
})().catch(err => {
	console.error(err);
});

const sqlType = {
	integer: 'bigint',
	number: 'numeric(10,2)',
	string: 'text',
	boolean: 'boolean',
};

function getClause(schema, column) {
	const clauses = {
		identity: `generated always as identity`,
		primaryKey: `ALTER TABLE "${schema.$id}" ADD CONSTRAINT "pk${schema.$id}" PRIMARY KEY ("accountId");`,
		$ref: `ALTER TABLE "${schema.$id}" ADD CONSTRAINT "fk${
			schema.$id + column.$ref
		}" FOREIGN KEY ("id") REFERENCES "${column.$ref}" ("id");`,
		index: `CREATE UNIQUE INDEX "ak${schema.$id}" ON "${schema.$id}" ("login);`,
		nullable: `NOT NULL`,
	};
	return clauses;
}

function schemaToTable(schema) {
	let query = `CREATE TABLE "${schema.$id}" (${os.EOL}`;
	const columns = schema.properties;
	const columnsName = Object.keys(columns);
	const fields = columnsName.reduce((data, name) => {
		const clauses = getClause(schema, columns[name]);
		console.log(clauses);
		const field = `\t"${name}" ${sqlType[columns[name].type] ?? sqlType.integer} ;${os.EOL}`;
		return data + field;
	}, '');
	const table = query.concat(fields, `);${os.EOL + os.EOL}`);
	return table;
}

async function createStructure(schemas) {
	const MY_STRUCTURE = path.join(DB, 'myStructure.sql');
	let data = '';
	for (const schema of schemas) {
		data += schemaToTable(schema);
	}
	await fsp.writeFile(MY_STRUCTURE, data);
}

// const { Client } = require('pg');
// const fs = require('fs');
// const schemaFilePath = 'schemas.json';
// const schemaData = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
async function createTables() {
	const client = new pg.Client(dbConfig);
	try {
		await client.connect();
		// Generate queries dynamically based on schema data
		for (const entity in schemaData.properties) {
			const { type, properties, required } = schemaData.properties[entity];
			const columns = Object.keys(properties)
				.map(prop => `${prop} ${getDataType(properties[prop])}`)
				.join(', ');

			await client.query(`
        CREATE TABLE IF NOT EXISTS ${entity} (
          ${columns},
          PRIMARY KEY (${required.join(', ')})
        );
      `);
		}
		console.log('Tables created successfully!');
	} catch (error) {
		console.error('Error creating tables:', error);
	} finally {
		await client.end();
	}
}

// Helper function to map JSON schema types to PostgreSQL data types
function getDataType(jsonType) {
	if (jsonType.type === 'string') {
		return 'VARCHAR(255)';
	} else if (jsonType.type === 'integer') {
		return 'INTEGER';
	} else if (jsonType.type === 'number') {
		return 'NUMERIC(10, 2)';
	}
	// Handle other data types as needed (e.g., dates, booleans, etc.)
	// You can extend this function based on your specific requirements.
	return 'TEXT';
}

async function getSchemasArr() {
	const schemaNames = await fsp.readdir(SCHEMAS);
	const schemaFiles = [];
	for (const name of schemaNames) schemaFiles.push(require(path.join(SCHEMAS, name)));
	return schemaFiles;
}

async function validateEntity() {
	const schemaFilesArr = await getSchemasArr();
	const ajv = new Ajv({ strict: false, schemas: schemaFilesArr, allErrors: true });
	const validator = ajv.getSchema('Subjects');
	if (!validator(entitySubject)) throw new Error('invalid entity', { cause: validator.errors });
	console.log('valid entity');
}

async function cleanDb() {
	const dbConnection = new pg.Client(config.pg);
	try {
		await dbConnection.connect();
		await dbConnection.query(`drop database example;`);
		await dbConnection.query(`drop user marcus;`);
		await dbConnection.end();
	} catch (error) {
		console.log(error, 'error inside cleanDb');
	}
}
