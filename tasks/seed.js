const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
bcrypt = require('bcryptjs');
const users = data.users;
saltRounds  = 5;

async function main() {
	const db = await dbConnection();

	
	const test_user4_pw = await bcrypt.hash('Arman2', saltRounds);
	await users.addUser('arman2', 'arman2@gmail.com', '913-607-0188', test_user4_pw);

	// const test_user5_pw = await bcrypt.hash('Gil225', saltRounds);
	// await users.addUser('gil225', 'gil225@gmail.com', '426-001-4994', test_user5_pw);
	
	// const test_user6_pw = await bcrypt.hash('Susan8', saltRounds);
    // await users.addUser('susan8', 'susan8@gmail.com', '394-666-3799', test_user6_pw);

	console.log('Done seeding database');

	await db.serverConfig.close();
}

main();
