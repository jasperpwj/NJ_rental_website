const express     = require('express'), 
 	  data 		  = require('../data'), 
	  bcrypt  	  = require('bcryptjs'),
	  router      = express.Router(),
	  userData    = data.users,
	  houseData   = data.houses,
	  commentData = data.comments,
	  saltRounds  = 5;

router.get('/new', async (req, res) => {
	res.render('usershbs/new', {});
});

router.get('/login', async (req, res) => {
	res.render('usershbs/login', {});
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
	try {
		const user = await userData.getUserById(req.params.id);
		res.render('usershbs/single', {user: user});
	} catch (e) {
		res.status(404).json({ error: 'User not found' });// todo!!!!!!!!!!!!!!!!!!!!
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

	if (!userInfo.username)    errors.push('You must provide a username');
	if (!userInfo.email) 	   errors.push('You must provide a valid email');
	if (!userInfo.phoneNumber) errors.push('You must provide a phone number');
	if (!userInfo.password)    errors.push('You must provide a password');

	if (errors.length > 0) {
		res.render('usershbs/new', {
			errors: errors,
			hasErrors: true,
			newUser: userInfo
		});
		return;
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
	const message = "Either username or password do not match";
	
	if (!userInfo.username) errors.push('No username provided');
	if (!userInfo.password) errors.push('No password provided');
	if (errors.length > 0) {
		res.status(401).render('usershbs/login', {error: errors, hasErrors: true});
		return;
	}

	try {
		const user = await userData.getUserByName(userInfo.username);
		let compare = await bcrypt.compare(userInfo.password, user.password);
		if (compare) {
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

router.get('/storehouse/:houseid', async (req, res) => {
	try {
		const house = await houseData.getHouseById(req.params.houseid);
		await userData.storeHouse(
			req.session.user.id, 
			req.params.houseid, 
			house.houseInfo
		);
		res.redirect(`/users/${req.session.user.id}`); // todo!!!!!!!!!!!!!!!!!!!!
	} catch (e) {
		res.sendStatus(500);
	}
});

router.get('/removestorehouse/:houseid', async (req, res) => {
	try {
		await userData.removeStoredHouse(req.session.user.id, req.params.houseid);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.sendStatus(500);
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
router.delete('/:id', async (req, res) => {
	if (!req.params.id) throw 'You must specify an ID to delete';
	let user = null;
	try {
		user = await userData.getUserById(req.params.id);
		if(user.houseLists.length !== 0){
			for(let i = 0; i < user.houseLists.length; i++){
				const houseId = user.houseLists[i]._id;
				const house = await houseData.getHouseById(houseId);
				if(house.comments.length !== 0){
					for(let i = 0; i < house.comments.length; i++){
						const commentId = house.comments[i]._id;
						await commentData.removeComment(commentId);
					}
				}
				await houseData.removeHouse(houseId);
			}
		}
		if(user.comments.length !== 0){
			for(let i = 0; i < user.comments.length; i++){
				const commentId = user.comments[i]._id;
				await commentData.removeComment(commentId);
			}
		}
	} catch (e) {
		res.status(404).json({ error: 'User not found' });
		return;
	}

	try {
		await userData.removeUser(req.params.id);
		res.json({"deleted": true, "data": user});
	} catch (e) {
		res.sendStatus(500);
	}
});

module.exports = router;