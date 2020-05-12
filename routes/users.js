const express     = require('express'), 
 	  data 		  = require('../data'), 
	  bcrypt  	  = require('bcryptjs'),
	  router      = express.Router(),
	  userData    = data.users,
	  houseData   = data.houses,
	  saltRounds  = 5;

router.get('/new', async (req, res) => {
	res.render('usershbs/new', {});
});

router.get('/login', async (req, res) => {
	res.render('usershbs/login', {});
});

router.get('/profile', async (req, res) => {
	res.redirect(`/users/${req.session.user.id}`);
});

router.get('/logout', async (req, res) => {
	req.session.user = undefined;
	res.redirect('/houses');
});

router.get('/:id/edit', async (req, res) => {
	try {
		const user = await userData.getUserById(req.params.id);
		res.render('usershbs/edit', {user: user});
	} catch (e) {
		res.status(404).json({ error: 'User not found' });// todo!!!!!!!!!!!!!!!!!!!!
	}
});

router.get('/:id/newHouse', async (req, res) => {
	try {
		await userData.getUserById(req.params.id);
		res.render('houseshbs/new', {userid: req.params.id});
	} catch (e) {
		res.status(404).json({ error: 'User not found' });// todo!!!!!!!!!!!!!!!!!!!!
	}
});

router.get('/:id', async (req, res) => {
	if (!req.session.user) {
		return res.status(401).render('usershbs/login');
	} 
	else if(req.session.user.id !== req.params.id) {
		return res.sendStatus(403);
	}
	try {
		const user = await userData.getUserById(req.params.id);
		res.render('usershbs/single', {user: user});
	} catch (e) {
		res.status(404).json({ error: 'User not found' });// todo!!!!!!!!!!!!!!!!!!!!
	}
});

router.get('/removestorehouse/:houseid', async (req, res) => {
	try {
		await houseData.removeStoreByUser(req.params.houseid, req.session.user.id);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.status(404).json({ error: 'User/House not found' });
	}
});

/******************** todo ********************/
router.get('/', async (req, res) => {
	try {
		const userList = await userData.getAllUsers();
		res.json(userList);
	} catch (e) {
		res.sendStatus(500);
	}
});
/******************** todo ********************/

router.post('/', async (req, res) => {
	let userInfo = req.body;
	let errors = [];
	let allNames = [];
	let allEmails = [];
	try {
		const userList = await userData.getAllUsers();
		for (let i = 0; i < userList.length; i++) {
			allNames.push(userList[i].username);
			allEmails.push(userList[i].email);
		}
	} catch (e) {
		return res.sendStatus(500);
	}
	if (!userInfo.username) {
		errors.push('Error: Please check that you\'ve entered an username');
	} else {
		let username = userInfo.username;
		for (let i = 0; i < allNames.length; i++) {
			if (username.toLowerCase() === allNames[i].toLowerCase()) {
				errors.push('Error: The username you entered is invalid, please try another one');
			}
		}
	}
	if (!userInfo.email) {
		errors.push('Error: Please check that you\'ve entered an email');
	} else {
		const email = userInfo.email.toLowerCase();
		for (let i = 0; i < allEmails.length; i++) {
			if (email === allEmails[i].toLowerCase()) {
				errors.push('Error: The email you entered is invalid, please try another one');
			}
		}
	}
	if (!userInfo.phoneNumber) errors.push('Error: Please check that you\'ve entered a phone number');
	if (!userInfo.password)    errors.push('Error: Please check that you\'ve entered a password');
	if (errors.length > 0) {
		return res.render('usershbs/new', {
			errors: errors,
			hasErrors: true,
			newUser: userInfo
		});
	}

	try {
		const pw = await bcrypt.hash(userInfo.password, saltRounds);
		const newuser = await userData.addUser(
			userInfo.username, userInfo.email, userInfo.phoneNumber, pw
		);
		req.session.user = {id: newuser._id, name: newuser.username};
		res.redirect(`/users/${newuser._id}`);
	} catch (e) {
		res.sendStatus(500);
	}
});

router.post('/login', async (req, res) => {
	let userInfo = req.body;
	let errors = []; 
	const message = "Error: Either username or password does not match";
	
	if (!userInfo.username) errors.push('Error: Please check that you\'ve entered an username');
	if (!userInfo.password) errors.push('Error: Please check that you\'ve entered a password');
	if (errors.length > 0) {
		res.status(401).render('usershbs/login', {error: errors, hasErrors: true});
		return;
	}

	try {
		const user = await userData.getUserByName(userInfo.username);
		const passwordIsCorrect = await bcrypt.compare(userInfo.password, user.password);
		if (passwordIsCorrect) {
			req.session.user = {id: user._id, name: user.username};
			return res.redirect(`/users/${user._id}`);
		} else {
			return res.status(401).render('usershbs/login', {
				error: [message], hasErrors: true
			});
		}
	} catch (e) {
		res.render('usershbs/login', {error: [message], hasErrors: true});
	}
});

router.patch('/:id', async (req, res) => {
	const reqBody = req.body;
	
	let updatedObject = {};
	try {
		const user = await userData.getUserById(req.params.id);
        if (reqBody.email && reqBody.email !== user.email) {
			updatedObject.email = reqBody.email;
		}
        if (reqBody.phoneNumber && reqBody.phoneNumber !== user.phoneNumber) {
			updatedObject.phoneNumber = reqBody.phoneNumber;
		}
        if (reqBody.password) {
			const pw = await bcrypt.hash(reqBody.password, saltRounds);
			updatedObject.password = pw;
		}
	} catch (e) {
		res.status(404).json({ error: 'Update failed' }); // todo!!!!!!!!!!!!!!!!!!!!!!!!!!!
		return;
	}
	try {
		await userData.updateUser(req.params.id, updatedObject);
		res.redirect(`/users/${req.params.id}`);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

/******************** todo ********************/
// router.delete('/:id', async (req, res) => {
// 	if (!req.params.id) throw 'You must specify an ID to delete';
// 	let user = null;
// 	try {
// 		user = await userData.getUserById(req.params.id);
// 		if(user.houseLists.length !== 0){
// 			for(let i = 0; i < user.houseLists.length; i++){
// 				const houseId = user.houseLists[i]._id;
// 				const house = await houseData.getHouseById(houseId);
// 				if(house.comments.length !== 0){
// 					for(let i = 0; i < house.comments.length; i++){
// 						const commentId = house.comments[i]._id;
// 						await commentData.removeComment(commentId);
// 					}
// 				}
// 				await houseData.removeHouse(houseId);
// 			}
// 		}
// 		if(user.comments.length !== 0){
// 			for(let i = 0; i < user.comments.length; i++){
// 				const commentId = user.comments[i]._id;
// 				await commentData.removeComment(commentId);
// 			}
// 		}
// 	} catch (e) {
// 		res.status(404).json({ error: 'User not found' });
// 		return;
// 	}

// 	try {
// 		await userData.removeUser(req.params.id);
// 		res.json({"deleted": true, "data": user});
// 	} catch (e) {
// 		res.sendStatus(500);
// 	}
// });

module.exports = router;