'use strict';

import fs from 'node:fs/promises';
import vm from 'node:vm';

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };

export default async (filePath, sandbox) => {
	const src = await fs.readFile(filePath, 'utf8');
	const code = `'use strict';\n${src}`;
	const script = new vm.Script(code);
	const context = vm.createContext(Object.freeze({ ...sandbox }));
	const exported = script.runInContext(context, RUN_OPTIONS);
	return exported;
};
