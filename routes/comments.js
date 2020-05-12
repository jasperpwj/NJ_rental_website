const express = require('express');
const router = express.Router();
const data = require('../data');
const commentData = data.comments;

/******************** todo ********************/
router.get('/:id', async (req, res) => {
	try {
		const comment = await commentData.getCommentById(req.params.id);
		res.json(comment);
	} catch (e) {
		res.status(404).json({ error: 'Comment not found' });
	}
});

router.get('/', async (req, res) => {
	try {
		const commentList = await commentData.getAllComments();
		res.json(commentList);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});
/******************** todo ********************/

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
		res.status(500).json({ error: e }); // todo!!!!!!!!!!!!!!!!!!
	}
});

module.exports = router;