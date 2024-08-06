'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const pg = require('pg');
const config = require('./config.js');
const os = require('node:os');
const url = require('node:url');

// const { validator } = require('@exodus/schemasafe');
const Ajv = require('ajv/dist/2019');

const DB = path.join(process.cwd(), './db');
const SCHEMAS = path.join(process.cwd(), './json-schemas');

const entity = {
	id: 1,
	name: 'john',
	middleName: 'mark',
	surname: 'bob',
	// role: { id: 1, role: 'professor' },
};

(async () => {
	// await cleanDb();
	const schemaFilesArr = await getSchemaFilesArr();
	const ajv = new Ajv({ schemas: schemaFilesArr, allErrors: true });
	const validator = ajv.getSchema('Teachers');
	console.log(validator(entity), validator.errors);
})().catch(err => {
	console.error(err);
});

async function getSchemaFilesArr() {
	const schemaNames = await fsp.readdir(SCHEMAS);
	const schemaFiles = [];
	for (const name of schemaNames) schemaFiles.push(require(path.join(SCHEMAS, name)));
	return schemaFiles;
}

// const { Client } = require('pg');
// const fs = require('fs');

// const schemaFilePath = 'schemas.json';
// const schemaData = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));

async function createTables() {
	const client = new Client(dbConfig);
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

// createTables();

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
