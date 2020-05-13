const express = require('express');
const router = express.Router();
const data = require('../data');
const commentData = data.comments;
const xss = require('xss');

router.post('/', async (req, res) => {
	if (!req.body || !req.body.text) {
		res.redirect(`/houses/${xss(req.body.houseId)}`);
		return;
	}
	try {
		const comment = await commentData.addComment(xss(req.session.user.id), xss(req.body.houseId), xss(req.body.text));
		res.redirect(`/houses/${comment.house._id}`);
	} catch (e) {
		res.sendStatus(500);
	}
});

router.delete('/:id', async (req, res) => {
	try {
		await commentData.removeComment(xss(req.params.id));
		res.redirect(`/users/${xss(req.session.user.id)}`);
	} catch (e) {
		res.sendStatus(500);
	}
});

module.exports = router;