const express = require('express');
const data = require('../data');
const xss = require('xss');
const router = express.Router();
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
	let usr;
	if(req.session.user) {
		 usr = true;
	} else {
		usr = false;
	}
	const houseList = await houseData.getAllHouses();
	res.render('houseshbs/index', {houses: houseList, usr: usr});
});

router.get('/:id', async (req, res) => {
	let usrs;
	if(req.session.user) {
		usrs = true;
	} else {
		usrs = false;
	}
	
	
	try {
		const house = await houseData.getHouseById(req.params.id);
		if(req.session.user){
			const storeList = house.storedByUsers;
			for(let i = 0; i < storeList.length; i++){
				if(storeList[i]._id === req.session.user.id){
					return res.render('houseshbs/single', {
						houses: house,
						usrs: usrs,
						houseid: req.params.id,
						isStored: true
					});
				}
			}
		}
		res.render('houseshbs/single', {
			houses: house, 
			houseid: req.params.id
		});
	} catch (e) {
		res.status(404).render('errorshbs/error404');
	}
});

router.get('/storehouse/:houseid', async (req, res) => {
	try {
		await houseData.getHouseById(req.params.houseid);
		await houseData.storedByUser(req.params.houseid, req.session.user.id);
		res.redirect(`/houses/${req.params.houseid}`);
	} catch (e) {
		res.status(404).render('errorshbs/error404');
	}
});

router.get('/removestorehouse/:houseid', async (req, res) => {
	try {
		await houseData.getHouseById(req.params.houseid);
		await houseData.removeStoreByUser(req.params.houseid, req.session.user.id);
		res.redirect(`/houses/${req.params.houseid}`);
	} catch (e) {
		res.status(404).render('houseshbs/index', {
			houses: [], 
			isEmpty: true,
			error: "Sorry, we couldn't find the house!"
		});
	}
});

router.get('/:id/edit', async (req, res) => {
	try {
		const house = await houseData.getHouseById(req.params.id);
		let imgs = [];
		if(house.images.length > 0){
			for(let i = 0; i < house.images.length; i++){
				const img = await gfs.files.findOne({ filename: house.images[i] });
				imgs.push(img);
			}
			return res.render('houseshbs/edit', {house: house, hasImages: true, images: imgs});
		} else {
			res.render('houseshbs/edit', {house: house, hasImages: false});
		}
	} catch (e) {
		res.status(404).render('errorshbs/error404');
	}
});

router.get('/image/:filename', async(req, res) => {
    try{
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file || file.length === 0) {
            return res.status(404).render('errorshbs/error404');
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    }catch(e){
        res.status(404).render('errorshbs/error404');
    }
});

router.post('/sort', async (req, res) => {
	const sortData = req.body;
	if(!sortData.sort){
		const houseList = await houseData.getAllHouses();
		return res.render('houseshbs/index', {houses: houseList});
	}
	else if(sortData.sort === "priceUp"){
		const houseList = await houseData.getAllHousesSortedByPriceAsc();
		return res.render('houseshbs/index', {houses: houseList});
	}
	else if(sortData.sort === "priceDown"){
		const houseList = await houseData.getAllHousesSortedByPriceDec();
		return res.render('houseshbs/index', {houses: houseList});
	}
	else if(sortData.sort === "newest"){
		const houseList = await houseData.getAllHousesSortedByDateDec();
		return res.render('houseshbs/index', {houses: houseList});
	}
});

router.post('/search', async (req, res) => {
	const searchData = req.body.search;
	let low = req.body.low;
	let high = req.body.high;
	low = Number( low );
	high = Number( high );

	let houseList = [];
	if ((!searchData&&(!low||!high)) || low > high) {
		houseList = await houseData.getAllHouses();
		return res.status(400).render('errorshbs/error400');
	}
	else if (!searchData && (low <= high)) {
		houseList = await houseData.findByPriceRange(low, high);
	}
	else if (searchData && !low && !high) {
		houseList = await houseData.findByRoomType(searchData);
	}
	else {
		houseList = await houseData.findByRoomTypeAndPriceRange(searchData, low, high);
	}
	if (houseList.length == 0) {
		return res.status(401).render('houseshbs/index', {
			houses: houseList, 
			isEmpty: true, 
			error: "Sorry, we couldn't find any house, please change your search range!"});
	} else {
		return res.render('houseshbs/index', {houses: houseList, isEmpty: false});
	}
});

router.post('/', upload.single('image'), async (req, res) => {
	let housePostData = req.body;
	let errors = [];

	if (!housePostData.houseInfo) {
		errors.push('No house information provided');
	}
	if (!housePostData.statement) {
		errors.push('No house statement provided');
	}

	if (!housePostData.lat) {
		errors.push('No latitude provided');
	} else {
		housePostData.lat = Number( housePostData.lat );
	}

	if (!housePostData.lng) {
		errors.push('No longitude provided');
	} else {
		housePostData.lng = Number( housePostData.lng );
	}

    if (!housePostData.roomType) {
		errors.push('No room type provided');
	
	}
    if (!housePostData.price) {
		errors.push('No rental price provided');
	} else {
		housePostData.price = Number( housePostData.price );
	}

	if (!req.file) {
		errors.push('No image provided');
	}

	if (errors.length > 0) {
		res.status(401).render('houseshbs/new', {
			errors: errors,
			hasErrors: true,
			newHouse: housePostData
		});
		return;
	}

	const images = req.file.filename;
	try {
		const {houseInfo, statement, userId, lat, lng, roomType, price} = housePostData;
		const newhouse = await houseData.addHouse(
            houseInfo, statement, userId, lat, lng, roomType, price, images
        );
		res.redirect(`/houses/${newhouse._id}`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

/*********************************************************************************/
//AJAX routes
router.post('/new', async (req, res) => {
	if(!req.session.user){
		return;
	}
	const newComment = await commentData.addComment(req.session.user.id, req.body.houseId, req.body.text);
	res.render('partials/addcomment', {layout: null, ...newComment});
});

/*********************************************************************************/

router.post('/addimg/:id', upload.single('image'), async (req, res) => {
	if(!req.file){
		return res.redirect(`/houses/${req.params.id}/edit`);
	}
	let updatedObject = {};
	try {
		const oldHouse = await houseData.getHouseById(req.params.id);
		updatedObject.images = oldHouse.images;
		updatedObject.images.push(req.file.filename);
	} catch (e) {
		res.status(404).render('errorshbs/error404');
		return;
	}
	try {
		await houseData.updateHouse(req.params.id, updatedObject);
		res.redirect(`/houses/${req.params.id}/edit`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

router.patch('/:id', async (req, res) => {
	const reqBody = req.body;

	let updatedObject = {};
	try {
		const house = await houseData.getHouseById(req.params.id);
        if (reqBody.statement && reqBody.statement !== house.statement) {
			updatedObject.statement = reqBody.statement;
		}
        if (reqBody.roomType && reqBody.roomType !== house.roomType) {
			updatedObject.roomType = reqBody.roomType;
		}
        if (reqBody.price) {
			const price = Number( reqBody.price );
			if(price !== house.price) {
				updatedObject.price = price;
			}
		} 
	} catch (e) {
		return res.status(404).render('errorshbs/error404');
	}
	try {
		await houseData.updateHouse(req.params.id, updatedObject);
		res.redirect(`/houses/${req.params.id}/edit`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
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
		return res.status(404).render('errorshbs/error404');
	}
	try {
		await houseData.updateHouse(req.params.id, updatedObject);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
	
    try{
        await gfs.remove({ filename: req.params.filename, root: 'images' });
        return res.redirect(`/houses/${req.params.id}/edit`);
    } catch(e) {
        res.status(500).render('errorshbs/error500');
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
		return res.status(404).render('errorshbs/error404');
	}
	try {
		await houseData.removeHouse(req.params.id);
		res.redirect(`/users/${req.session.user.id}`);
	} catch (e) {
		res.status(500).render('errorshbs/error500');
	}
});

module.exports = router;
