const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const NGO = require('../models/NGO');
const { isDBConnected } = require('../config/db');

const memoryRatings = [];

// @desc    Add review and rating for an NGO
// @route   POST /api/ratings
// @access  Public
exports.addRating = async (req, res) => {
  try {
    const { ngoId, ngoName, userName, rating, review, aidRequestId } = req.body;

    if ((!ngoId && !ngoName) || !userName || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide NGO ID or Name, reviewer name, rating (1-5), and review text'
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating score must be between 1 and 5'
      });
    }

    if (isDBConnected()) {
      // 1. Resolve Target NGO
      let targetNGO = null;
      if (ngoId && mongoose.Types.ObjectId.isValid(ngoId)) {
        targetNGO = await NGO.findById(ngoId);
      }
      if (!targetNGO && ngoName) {
        targetNGO = await NGO.findOne({ name: new RegExp(`^${ngoName.trim()}$`, 'i') });
      }
      if (!targetNGO && ngoId) {
        targetNGO = await NGO.findOne({
          $or: [
            { registration_number: ngoId },
            { name: new RegExp(`^${ngoId.trim()}$`, 'i') }
          ]
        });
      }

      const canonicalNGOId = targetNGO ? String(targetNGO._id) : String(ngoId || '');
      const canonicalNGOName = targetNGO ? targetNGO.name : (ngoName || 'Verified NGO');

      // 2. Persist Review
      const newRating = await Rating.create({
        ngo: targetNGO ? targetNGO._id : null,
        ngoId: canonicalNGOId,
        ngoName: canonicalNGOName,
        userName: userName.trim(),
        rating: numericRating,
        review: review.trim(),
        aidRequest: aidRequestId || null,
        user: req.user ? req.user._id : null
      });

      // 3. Dynamically re-aggregate average rating for the NGO
      let updatedNGO = null;
      if (targetNGO) {
        const allRatings = await Rating.find({
          $or: [
            { ngo: targetNGO._id },
            { ngoId: canonicalNGOId },
            { ngoName: canonicalNGOName }
          ]
        });

        const totalScore = allRatings.reduce((sum, item) => sum + item.rating, 0);
        const dynamicAvg = Math.round((totalScore / allRatings.length) * 10) / 10;

        targetNGO.rating = dynamicAvg;
        targetNGO.ratingCount = allRatings.length;
        updatedNGO = await targetNGO.save();
      }

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: newRating,
        updatedNGO
      });
    } else {
      // In-memory fallback
      const mockRating = {
        _id: 'rate_' + Date.now(),
        ngoId: ngoId || '1',
        ngoName: ngoName || 'Verified NGO',
        userName: userName.trim(),
        rating: numericRating,
        review: review.trim(),
        createdAt: new Date().toISOString()
      };
      memoryRatings.unshift(mockRating);

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully (in-memory mode)',
        data: mockRating
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting rating'
    });
  }
};

// @desc    Get all reviews or filtered reviews
// @route   GET /api/ratings
// @access  Public
exports.getAllRatings = async (req, res) => {
  try {
    if (isDBConnected()) {
      const ratings = await Rating.find({}).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } else {
      return res.status(200).json({
        success: true,
        count: memoryRatings.length,
        data: memoryRatings
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};

// @desc    Get all reviews for an NGO
// @route   GET /api/ratings/ngo/:ngoId
// @access  Public
exports.getNGORatings = async (req, res) => {
  try {
    const { ngoId } = req.params;

    if (isDBConnected()) {
      const query = {
        $or: [
          { ngoId: String(ngoId) },
          { ngoName: String(ngoId) }
        ]
      };
      if (mongoose.Types.ObjectId.isValid(ngoId)) {
        query.$or.push({ ngo: ngoId });
      }

      const ratings = await Rating.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } else {
      const list = memoryRatings.filter(r => String(r.ngoId) === String(ngoId));
      return res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};
