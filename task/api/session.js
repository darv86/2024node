'use strict';

export default sandbox => {
	const { db } = sandbox;
	const session = db('session');
	return session;
};
