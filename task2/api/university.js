({
	async addTeacher({ id, name, middleName, surname, role, subject, department }) {
		console.log({ method: 'auth.addTeacher', id, name, middleName, surname, role, subject, department });
		return { status: 'ok', teacher: id };
	},

	async removeTeacher({ id }) {
		console.log({ method: 'auth.removeTeacher', id });
		return { status: 'ok' };
	},

	async changeRole({ id, role }) {
		console.log({ method: 'auth.changeRole', id, role });
		return { status: 'ok' };
	},

	async changeSubject({ id, subject }) {
		console.log({ method: 'auth.changeSubject', id, subject });
		return { status: 'ok' };
	},

	async changeDepartment({ id, department }) {
		console.log({ method: 'auth.changeDepartment', id, department });
		return { status: 'ok' };
	},
});
