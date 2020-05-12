const express = require('express');
const router = express.Router();
const data = require('../data');
const commentData = data.comments;

router.post('/', async (req, res) => {
	if (!req.body || !req.body.text) {
		res.redirect(`/houses/${req.body.houseId}`);
		return;
	}
	try {
		const comment = await commentData.addComment(req.session.user.id, req.body.houseId, req.body.text);
		res.redirect(`/houses/${comment.house._id}`);
	} catch (e) {
		res.sendStatus(500);
	}
});

router.delete('/:id', async (req, res) => {
	try {
		await commentData.removeComment(req.params.id);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.sendStatus(500);
	}
});

module.exports = router;