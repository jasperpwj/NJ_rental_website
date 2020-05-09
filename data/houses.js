const mongoCollections = require('../config/mongoCollections');
const houses = mongoCollections.houses;
const users = require('./users');
const ObjectId = require("mongodb").ObjectId;

module.exports = {
    async getAllHouses() {
        const houseCollection = await houses();
        return await houseCollection.find({}).toArray();
    },

    /************************ advanced mongodb ************************/
    async getAllHousesSortedByPriceAsc() {
        const houseCollection = await houses();
		return await houseCollection.find({}).sort({ price: 1 }).toArray();
    },

    async getAllHousesSortedByPriceDec() {
        const houseCollection = await houses();
		return await houseCollection.find({}).sort({ price: -1 }).toArray();
    },

    async getAllHousesSortedByDateDec() {
        const houseCollection = await houses();
		return await houseCollection.find({}).sort({ postedDate: -1 }).toArray();
    },

    async findByRoomType(roomType){
        if (!roomType) throw 'You must provide room type';
        const houseCollection = await houses();
        return await houseCollection.find({ 'roomType': roomType }).toArray();
    },

    async findByPriceRange(low, high){
        const houseCollection = await houses();
        return await houseCollection.find({ 'price': {$gte: low, $lte: high} }).toArray();
    },

    async findByRoomTypeAndPriceRange(roomType, low, high){
        const houseCollection = await houses();
        return await houseCollection
            .find({ 
                $and: [ { 'roomType': roomType }, {'price': {$gte: low, $lte: high}} ]
            })
            .toArray();
    },
    /************************ advanced mongodb ************************/

    async getHouseById(id) {
        const houseCollection = await houses();
        if(typeof id === 'string'){
            id = ObjectId.createFromHexString(id);
        }
        const house = await houseCollection.findOne({_id: id});
        if (!house) throw 'House not found';
        return house;
    },

    async addHouse(houseInfo, statement, userId, lat, lng, roomType, price, image) {
        let imgs = [];
        imgs.push(image);
        const d = new Date();
        const date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

        const houseCollection = await houses();
        const user = await users.getUserById(userId);
        const newHouse = {
            houseInfo: houseInfo,
            postedDate: date,
            statement: statement,
            user: {
                _id: userId,
                username: `${user.username}`
            },
            lat: lat,
            lng: lng,
            roomType: roomType,
            price: price,
            images: imgs,
            comments: []
        };
        const insertInfo = await houseCollection.insertOne(newHouse);
        const houseId = insertInfo.insertedId + "";
        await users.addHouseToUser(userId, houseId, houseInfo);
        return await this.getHouseById(insertInfo.insertedId);
    },

    async updateHouse(id, newHouse) {
        const houseCollection = await houses();
        let updatedHouse = await this.getHouseById(id);

        const d = new Date();
        const date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        updatedHouse.postedDate = date;
        
        if (newHouse.statement) updatedHouse.statement = newHouse.statement;
        if (newHouse.roomType) updatedHouse.roomType = newHouse.roomType;
        if (newHouse.price) updatedHouse.price = newHouse.price;
        if (newHouse.images) updatedHouse.images = newHouse.images;

        await houseCollection.updateOne({_id: ObjectId.createFromHexString(id)}, {$set: updatedHouse});
        return await this.getHouseById(id);
    },

    async removeHouse(id) {
        const houseCollection = await houses();
        const house = await this.getHouseById(id);
        await users.removeHouseFromUser(house.user._id, id);
        const deletionInfo = await houseCollection.removeOne({_id: ObjectId.createFromHexString(id)});
        if (deletionInfo.deletedCount === 0) throw `Could not delete house with id of ${id}`
        return house;
    },

    async addCommentToHouse(houseId, commentId, username, commentDate, text) {
        const houseCollection = await houses();
        if(typeof houseId === 'string'){
            houseId = ObjectId.createFromHexString(houseId);
        }
        const updateInfo = await houseCollection.updateOne(
            {_id: houseId},
            {$addToSet: {
                comments: {
                    _id: commentId, 
                    username: username,
                    commentDate: commentDate, 
                    text: text
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Failed to add comment to house';
        return await this.getHouseById(houseId);
    },

    async removeCommentFromHouse(houseId, commentId){
        const houseCollection = await houses();
        if(typeof houseId === 'string'){
            houseId = ObjectId.createFromHexString(houseId);
        }
        const updateInfo = await houseCollection.updateOne({_id: houseId}, {$pull: {comments: {_id: commentId}}});
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Failed to delete comment from house';
        return await this.getHouseById(houseId);
    }
};