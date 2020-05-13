const express     = require('express'), 
 	  data 		  = require('../data'), 
	  bcrypt  	  = require('bcryptjs'),
	  xss         = require('xss'),
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
		res.status(404).render('errorshbs/error404');
	}
});

router.get('/:id/newHouse', async (req, res) => {
	try {
		await userData.getUserById(req.params.id);
		res.render('houseshbs/new', {userid: req.params.id});
	} catch (e) {
		res.status(404).render('errorshbs/error404');
	}
});

router.get('/:id', async (req, res) => {
	if (!req.session.user) {
		return res.status(401).redirect('/users/login');
	} 
	else if(req.session.user.id !== req.params.id) {
		return res.status(403).render('errorshbs/error403');
	}
	try {
		const user = await userData.getUserById(req.params.id);
		res.render('usershbs/single', {user: user});
	} catch (e) {
		res.status(404).render('errorshbs/error404');
	}
});

router.get('/removestorehouse/:houseid', async (req, res) => {
	try {
		await houseData.removeStoreByUser(req.params.houseid, req.session.user.id);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.status(404).render('errorshbs/error404');
	}
});

router.post('/', async (req, res) => {
	let userInfo = xss(req.body);
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
		return res.status(500).render('errorshbs/error500');
	}
	if (!userInfo.username) {
		errors.push('Error: Please check that you\'ve entered an username');
	} else {
		let username = xss(userInfo.username);
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
		return res.status(401).render('usershbs/new', {
			errors: errors,
			hasErrors: true,
			newUser: xss(userInfo)
		});
	}

	try {
		const pw = await bcrypt.hash(userInfo.password, saltRounds);
		const newuser = await userData.addUser(
			xss(userInfo.username), xss(userInfo.email), xss(userInfo.phoneNumber), pw
		);
		req.session.user = {id: newuser._id, name: newuser.username};
		res.redirect(`/users/${newuser._id}`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

router.post('/login', async (req, res) => {
	let userInfo = xss(req.body);
	let errors = []; 
	const message = "Error: Either username or password does not match";
	
	if (!userInfo.username) errors.push('Error: Please check that you\'ve entered an username');
	if (!userInfo.password) errors.push('Error: Please check that you\'ve entered a password');
	if (errors.length > 0) {
		return res.status(401).render('usershbs/login', {error: errors, hasErrors: true});
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
		res.status(401).render('usershbs/login', {error: [message], hasErrors: true});
	}
});

router.patch('/:id', async (req, res) => {
	const reqBody = xss(req.body);
	
	let updatedObject = {};
	try {
		const user = await userData.getUserById(req.params.id);
        if (reqBody.email && reqBody.email !== user.email) {
			updatedObject.email = xss(reqBody.email);
		}
        if (reqBody.phoneNumber && reqBody.phoneNumber !== user.phoneNumber) {
			updatedObject.phoneNumber = xss(reqBody.phoneNumber);
		}
        if (reqBody.password) {
			const pw = await bcrypt.hash(reqBody.password, saltRounds);
			updatedObject.password = pw;
		}
	} catch (e) {
		return res.status(404).render('errorshbs/error404');
	}
	try {
		await userData.updateUser(req.params.id, updatedObject);
		res.redirect(`/users/${req.params.id}`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

module.exports = router;