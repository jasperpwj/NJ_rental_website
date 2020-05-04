const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const ObjectId = require("mongodb").ObjectId;

module.exports = {
    async getAllUsers() {
        const userCollection = await users();
        const userList = await userCollection.find({}).toArray();
        if (!userList) throw 'No users in system!';
        return userList;
    },

    async getUserById(id) {
        const userCollection = await users();
        if(typeof id === 'string'){
            id = ObjectId.createFromHexString(id);
        }
        const user = await userCollection.findOne({_id: id});
        if (!user) throw 'User not found';
        return user;
    },

    async getUserByName(name) {
        const userCollection = await users();
        const user = await userCollection.findOne({username: name});
        if (!user) throw 'User not found';
        return user;
    },
    
    async addUser(username, email, phoneNumber, password) {
        const userCollection = await users();
        const newUser = {
            username: username,
            email: email,
            phoneNumber: phoneNumber,
            password: password,
            houseLists: [],
            storedHouses: [],
            comments: []
        }; 
        const insertInfo = await userCollection.insertOne(newUser);
        if (insertInfo.insertedCount === 0) throw 'Insert failed!';
        return await this.getUserById(insertInfo.insertedId);
    },

    async updateUser(id, newUser){
        const userCollection = await users();
        let oldUser = null;
        try{
            oldUser = await this.getUserById(id);
        }catch (e){
            console.log(e);
            return;
        }
        if (newUser.email) oldUser.email = newUser.email;
        if (newUser.phoneNumber) oldUser.phoneNumber = newUser.phoneNumber;
        if (newUser.password) oldUser.password = newUser.password;

        const updatedInfo = await userCollection.updateOne({_id: ObjectId.createFromHexString(id)}, {$set: oldUser});
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) throw 'user update failed';
        return await this.getUserById(id);
    },
    
    async removeUser(id){
        if (!id) throw 'You must provide an id to search for';
        const userCollection = await users();
        if(typeof id === 'string'){
          id = ObjectId.createFromHexString(id);
        }
        const deletionInfo = await userCollection.deleteOne({_id: id});
        if (deletionInfo.deletedCount === 0) throw `Could not delete user with id of ${id}`;
        return true;
    },
    
    async addHouseToUser(userId, houseId, houseInfo){
        const userCollection = await users();
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
        const updateInfo = await userCollection.updateOne(
            {_id: userId},
            {$addToSet: {
                houseLists: {
                    _id: houseId, 
                    houseInfo: houseInfo,
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'House added to user failed';
        return await this.getUserById(userId);
    },
    
    async removeHouseFromUser(userId, houseId){
        const userCollection = await users();
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
        const updateInfo = await userCollection.updateOne(
            {_id: userId}, 
            {$pull: {
                houseLists: {
                    _id: houseId
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'House deleted from user failed';
        return await this.getUserById(userId);
    },

    async addCommentToUser(userId, commentId, houseInfo, commentDate, text) {
        const userCollection = await users();
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
        const updateInfo = await userCollection.updateOne(
            {_id: userId},
            {$addToSet: {
                comments: {
                    _id: commentId, 
                    houseInfo: houseInfo,
                    commentDate: commentDate, 
                    text: text
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Failed to add comment to user';
        return await this.getUserById(userId);
    },

    async removeCommentFromUser(userId, commentId){
        const userCollection = await users();
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
        const updateInfo = await userCollection.updateOne(
            {_id: userId}, 
            {$pull: {
                comments: {
                    _id: commentId
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Failed to delete comment from user';
        return await this.getUserById(userId);
    },

    async storeHouse(userId, houseId, houseInfo) {
        const userCollection = await users();
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
        const updateInfo = await userCollection.updateOne(
            {_id: userId},
            {$addToSet: {
                storedHouses: {
                    _id: houseId, 
                    houseInfo: houseInfo
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'USER Failed (store house)';
        return await this.getUserById(userId);
    },

    async removeStoredHouse(userId, houseId){
        const userCollection = await users();
        if(typeof userId === 'string'){
            userId = ObjectId.createFromHexString(userId);
        }
        const updateInfo = await userCollection.updateOne(
            {_id: userId}, 
            {$pull: {
                storedHouses: {
                    _id: houseId
                }}
            }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'USER Failed (remove stored house)';
        return await this.getUserById(userId);
    }
};