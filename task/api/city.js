'use strict';

export default sandbox => {
	const { db } = sandbox;
	return db('city');
};
