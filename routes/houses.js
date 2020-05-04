const express = require('express');
const router = express.Router();
const data = require('../data');
const houseData = data.houses;
const commentData = data.comments;

/*********************************************************************************/
const path = require('path');
const crypto = require('crypto');
const mongo = require('mongodb');
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');

let gfs;
mongo.MongoClient.connect('mongodb://localhost:27017', function(err, client) {
    const db = client.db('JerseyCityRentalWeb');
    gfs = Grid(db, mongo);
    gfs.collection('images');
});

const storage = new GridFsStorage({
	url: "mongodb://localhost:27017/JerseyCityRentalWeb", 
	file: (req, file) => {
	  	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
			const buf = crypto.randomBytes(16);
			const filename = buf.toString('hex') + path.extname(file.originalname);
			return {filename: filename, bucketName: 'images'};
	  	} else {
			return null;
	  	}
	}
});
const upload = multer({ storage });
/*********************************************************************************/

router.get('/', async (req, res) => {
	const houseList = await houseData.getAllHouses();
	res.render('houseshbs/index', {houses: houseList});
});

router.get('/:id', async (req, res) => {
	try {
		const house = await houseData.getHouseById(req.params.id);
		res.render('houseshbs/single', {
			houses: house, 
			houseid: req.params.id
		});
	} catch (e) {
		res.status(500).json({error: e}); // todo!!!!!!!!!!!!!!!!!!
	}
});

router.get('/:id/edit', async (req, res) => {
	try {
		const house = await houseData.getHouseById(req.params.id);
		let imgs = [];
		if(house.images){
			for(let i = 0; i < house.images.length; i++){
				const img = await gfs.files.findOne({ filename: house.images[i] });
				imgs.push(img);
			}
			res.render('houseshbs/edit', {house: house, hasImages: true, images: imgs});
			return;
		} else {
			res.render('houseshbs/edit', {house: house, hasImages: false});
		}
	} catch (e) {
		res.status(404).json({ error: 'User not found' }); // todo!!!!!!!!!!!!!!!!!!
	}
});

router.get('/image/:filename', async(req, res) => {
    try{
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file || file.length === 0) {
            return res.status(404).json({err: 'No file exists'}); // todo!!!!!!!!!!!!!!!!!!
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    }catch(e){
        res.status(404).json({ e: "GET /image/:filename" }); // todo!!!!!!!!!!!!!!!!!!
    }
});

router.post('/', upload.single('image'), async (req, res) => {
	let housePostData = req.body;
	let errors = [];

	if (!housePostData.houseInfo)  errors.push('No house information provided');
	if (!housePostData.postedDate) errors.push('No post date provided');
	if (!housePostData.statement)  errors.push('No house statement provided');
	if (!housePostData.userId) 	   errors.push('No user ID provided');
	if (!housePostData.latitude)   errors.push('No latitude provided');
	if (!housePostData.longitude)  errors.push('No longitude provided');
    if (!housePostData.roomType)   errors.push('No room type provided');
    if (!housePostData.price) 	   errors.push('No rental price provided');
	if (!req.file)  	   		   errors.push('No image provided');

	if (errors.length > 0) {
		res.render('houseshbs/new', {
			errors: errors,
			hasErrors: true,
			newHouse: housePostData
		});
		return;
	}

	let images = req.file.filename;
	try {
		const {houseInfo, postedDate, statement, userId, latitude, longitude, roomType, price} = housePostData;
		const newhouse = await houseData.addHouse(
            houseInfo, postedDate, statement, userId, latitude, longitude, roomType, price, images
        );
		res.redirect(`/houses/${newhouse._id}`);
	} catch (e) {
		res.sendStatus(500);
	}
});

router.post('/addimg/:id', upload.single('image'), async (req, res) => {
	if(!req.file){
		res.redirect(`/houses/${req.params.id}/edit`); // promise warning!!!!!!!!!!!!!!
	}
	let updatedObject = {};
	try {
		const oldHouse = await houseData.getHouseById(req.params.id);
		updatedObject.images = oldHouse.images;
		updatedObject.images.push(req.file.filename);
	} catch (e) {
		res.status(404).json({ error: 'Image added failed' }); // todo!!!!!!!!!!!!!!!!!!
		return;
	}
	try {
		await houseData.updateHouse(req.params.id, updatedObject);
		res.redirect(`/houses/${req.params.id}`);
	} catch (e) {
		res.status(500).json({ error: e }); // todo!!!!!!!!!!!!!!!!!!
	}
});

router.patch('/:id', async (req, res) => {
	const reqBody = req.body;

	let updatedObject = {};
	try {
		const oldHouse = await houseData.getHouseById(req.params.id);
        if (reqBody.postedDate && reqBody.postedDate !== oldHouse.postedDate) {
			updatedObject.postedDate = reqBody.postedDate;
		}
        if (reqBody.statement && reqBody.statement !== oldHouse.statement) {
			updatedObject.statement = reqBody.statement;
		}
        if (reqBody.roomType && reqBody.roomType !== oldHouse.roomType) {
			updatedObject.roomType = reqBody.roomType;
		}
        if (reqBody.price && reqBody.price !== oldHouse.price) {
			updatedObject.price = reqBody.price;
		}
	} catch (e) {
		res.status(404).json({ error: 'House update failed' }); // todo!!!!!!!!!!!!!!!!!!
		return;
	}
	try {
		await houseData.updateHouse(req.params.id, updatedObject);
		res.redirect(`/houses/${req.params.id}`);
	} catch (e) {
		res.status(500).json({ error: e }); // todo!!!!!!!!!!!!!!!!!!
	}
});

router.delete('/:id/removeimage/:filename', async(req, res) => {
	let updatedObject = {};
	try {
		const oldHouse = await houseData.getHouseById(req.params.id);
		updatedObject.images = oldHouse.images;

		const index = updatedObject.images.indexOf(req.params.filename);
		if (index > -1) {
			updatedObject.images.splice(index, 1);
		}
	} catch (e) {
		res.status(404).json({ error: 'Image removed failed' }); // todo!!!!!!!!!!!!!!!!!!
		return;
	}
	try {
		await houseData.updateHouse(req.params.id, updatedObject);
	} catch (e) {
		res.status(500).json({ error: "house info update (remove img) failed" }); // todo!!!!
	}
	
    try{
        await gfs.remove({ filename: req.params.filename, root: 'images' });
        return res.redirect(`/houses/${req.params.id}/edit`);
    }catch(e){
        res.status(404).json({ e: "DELETE /houses/removeimage/:filename" }); // todo!!!!!!!!!
    }
});

router.delete('/:id', async (req, res) => {
	if (!req.params.id) throw 'You must specify an ID to delete';
	let house = null;
	try {
		house = await houseData.getHouseById(req.params.id);
		if(house.comments.length !== 0){
			for(let i = 0; i < house.comments.length; i++){
				const commentId = house.comments[i]._id;
				await commentData.removeComment(commentId);
			}
		}
		if(house.images.length !== 0){
			for(let i = 0; i < house.images.length; i++){
				const filename = house.images[i];
				await gfs.remove({ filename: filename, root: 'images' });
			}
		}
	} catch (e) {
		res.status(404).json({ error: 'Delete failed (house)' }); // todo!!!!!!!!!!!!!!!!!!
		return;
	}
	try {
		await houseData.removeHouse(req.params.id);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.status(500).json({ error: e }); // todo!!!!!!!!!!!!!!!!!!
	}
});

module.exports = router;