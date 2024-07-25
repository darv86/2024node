({
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Teachers',
	type: 'object',
	properties: {
		id: { type: 'number', unique: true },
		name: { type: 'string' },
		surname: { type: 'string' },
		degree: {
			type: 'number',
		},
	},
	required: ['id', 'name', 'surname', 'degree'],
});
