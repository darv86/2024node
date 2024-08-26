'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const os = require('node:os');
const pg = require('pg');
const Ajv = require('ajv/dist/2019');
const config = require('./config.js');
const StructureBuilder = require('./db/structureBuilder.js');

const DB = path.join(process.cwd(), './db');
const SCHEMAS = path.join(process.cwd(), './json-schemas');
const MY_STRUCTURE = path.join(DB, 'myStructure.sql');

const read = name => fsp.readFile(path.join(DB, name), 'utf8');

const execute = async (client, sql) => {
	try {
		await client.query(sql);
	} catch (err) {
		console.error(err);
	}
};

const notEmpty = s => s.trim() !== '';

const executeFile = async (client, name) => {
	console.log(`Execute file: ${name}`);
	const sql = await read(name);
	const commands = sql.split(';' + os.EOL).filter(notEmpty);
	for (const command of commands) {
		await execute(client, command);
	}
};

(async () => {
	const schemas = await getSchemasArr(SCHEMAS);
	const structure = new StructureBuilder(schemas, MY_STRUCTURE);
	await structure.build();
	await createDb();
	// await cleanDb();
})().catch(err => {
	console.error(err);
});

async function createDb() {
	const inst = new pg.Client({ ...config.db, ...config.pg });
	await inst.connect();
	await executeFile(inst, 'install.sql');
	await inst.end();
	const db = new pg.Client(config.db);
	await db.connect();
	await executeFile(db, 'myStructure.sql');
	await executeFile(db, 'myData.sql');
	await db.end();
	console.log('Environment is ready');
}

async function getSchemasArr(url) {
	const schemaNames = await fsp.readdir(url);
	const schemaFiles = [];
	for (const name of schemaNames) schemaFiles.push(require(path.join(url, name)));
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
		console.log('db dropped');
	} catch (error) {
		console.log(error, 'error inside cleanDb');
	}
}
