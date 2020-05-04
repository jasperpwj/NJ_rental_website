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
	if(!req.session.user) return res.status(401).render('usershbs/login');

	let commentInfo = req.body; 
	if (!commentInfo) {
		res.redirect(`/houses/${commentInfo.houseId}`);
		return;
	}
	else if (!commentInfo.commentDate || !commentInfo.text) {
		res.redirect(`/houses/${commentInfo.houseId}`);
		return;
	}
	try {
		const comment = await commentData.addComment(
			req.session.user.id, 
			commentInfo.houseId, 
			commentInfo.commentDate,
			commentInfo.text
		);
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
		res.status(500).json({ error: e });
	}
});

module.exports = router;