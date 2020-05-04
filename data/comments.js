const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const users = require('./users');
const houses = require('./houses');
const ObjectId = require("mongodb").ObjectId;

module.exports = {
    async getAllComments() {
        const commentCollection = await comments();
        const commentList = await commentCollection.find({}).toArray();
        if (!commentList) throw 'No users in system!';
        return commentList;
    },

    async getCommentById(id) {
        const commentCollection = await comments();
        if(typeof id === 'string'){
            id = ObjectId.createFromHexString(id);
        }
        const comment = await commentCollection.findOne({_id: id});
        if (!comment) throw 'User not found';
        return comment;
    },

    async addComment(userId, houseId, commentDate, text) {
        const commentCollection = await comments();
        const user = await users.getUserById(userId);
        const house = await houses.getHouseById(houseId);
        const newComment = {
            user: {
                _id: userId,
                username: `${user.username}`
            },
            house: {
                _id: houseId,
                houseInfo: `${house.houseInfo}`
            },
            commentDate: commentDate,
            text: text
        };
        const insertInfo = await commentCollection.insertOne(newComment);
        const id = insertInfo.insertedId + "";
        await users.addCommentToUser(userId, id, house.houseInfo, commentDate, text);
        await houses.addCommentToHouse(houseId, id, user.username, commentDate, text);
        return await this.getCommentById(insertInfo.insertedId);
    },

    async removeComment(id) {
        const commentCollection = await comments();
        const comment = await this.getCommentById(id);
        await users.removeCommentFromUser(comment.user._id, id);
        await houses.removeCommentFromHouse(comment.house._id, id);
        const deletionInfo = await commentCollection.removeOne({_id: ObjectId.createFromHexString(id)});
        if (deletionInfo.deletedCount === 0) throw `Could not delete comment with id of ${id}`
        return;
    }
};