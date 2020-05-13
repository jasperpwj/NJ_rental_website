const express = require('express');
const router = express.Router();
const data = require('../data');
const xss = require('xss');
const commentData = data.comments;

router.post('/', async (req, res) => {
	if (!req.body || !req.body.text) {
		res.redirect(`/houses/${req.body.houseId}`);
		return;
	}
	try {
		const comment = await commentData.addComment(req.session.user.id, req.body.houseId, xss(req.body.text));
		res.redirect(`/houses/${comment.house._id}`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

router.delete('/:id', async (req, res) => {
	try {
		await commentData.removeComment(req.params.id);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

module.exports = router;