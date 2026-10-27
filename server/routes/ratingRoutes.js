const express = require('express');
const router = express.Router();
const { addRating, getAllRatings, getNGORatings } = require('../controllers/ratingController');

router.post('/', addRating);
router.get('/', getAllRatings);
router.get('/ngo/:ngoId', getNGORatings);

module.exports = router;
