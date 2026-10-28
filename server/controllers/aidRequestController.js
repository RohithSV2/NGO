const AidRequest = require('../models/AidRequest');
const { isDBConnected } = require('../config/db');
const { matchAidRequest } = require('../services/mlService');

// In-memory request store for fallback mode
const memoryRequests = [];

// @desc    Create new aid request and run ML recommendation matching
// @route   POST /api/requests
// @access  Public
exports.createAidRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency,
      city,
      state,
      address,
      requesterName,
      requesterPhone,
      requesterEmail,
      targetNGO,
      targetNgoName,
      isDirectRequest
    } = req.body;

    if (!title || !description || !requesterName || !requesterPhone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, city, requester name and phone number'
      });
    }

    const cleanPhone = String(requesterPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    // 1. Run Machine Learning & NLP matching engine
    const matchedNGOs = await matchAidRequest({
      title,
      description,
      category: category || 'General Aid',
      city,
      urgency: urgency || 'Medium'
    }, 5);

    let formattedMatches = matchedNGOs.map(m => ({
      ngoId: String(m.ngo_id),
      name: m.name,
      category: m.category,
      city: m.city,
      contactPhone: m.contact_phone,
      contactEmail: m.contact_email,
      matchScore: m.match_score,
      breakdown: m.breakdown,
      status: 'Suggested'
    }));

    const directTargetName = targetNgoName || targetNGO?.name || '';
    if (directTargetName) {
      formattedMatches = formattedMatches.filter(m => (m.name || '').toLowerCase() !== directTargetName.toLowerCase());
      formattedMatches.unshift({
        ngoId: String(targetNGO?.ngoId || targetNGO?._id || 'direct'),
        name: directTargetName,
        category: targetNGO?.category || category || 'General Aid',
        city: targetNGO?.city || city,
        contactPhone: targetNGO?.contactPhone || '',
        contactEmail: targetNGO?.contactEmail || '',
        matchScore: 100,
        breakdown: { directSelection: 100, note: 'Direct distress request sent by citizen to this NGO coordinator' },
        status: 'Notified'
      });
    }

    let savedRequest;

    if (isDBConnected()) {
      savedRequest = await AidRequest.create({
        title,
        description,
        category: category || 'General Aid',
        urgency: urgency || 'Medium',
        city,
        state: state || '',
        address: address || '',
        requesterName,
        requesterPhone: cleanPhone,
        requesterEmail: requesterEmail || '',
        user: req.user ? req.user._id : null,
        targetNgoName: directTargetName,
        isDirectRequest: Boolean(directTargetName || isDirectRequest),
        matchedNGOs: formattedMatches,
        status: formattedMatches.length > 0 ? 'Matched' : 'Pending'
      });
    } else {
      // In-memory fallback
      savedRequest = {
        _id: 'req_' + Date.now(),
        title,
        description,
        category: category || 'General Aid',
        urgency: urgency || 'Medium',
        city,
        state: state || '',
        address: address || '',
        requesterName,
        requesterPhone: cleanPhone,
        requesterEmail: requesterEmail || '',
        targetNgoName: directTargetName,
        isDirectRequest: Boolean(directTargetName || isDirectRequest),
        matchedNGOs: formattedMatches,
        status: formattedMatches.length > 0 ? 'Matched' : 'Pending',
        createdAt: new Date().toISOString()
      };
      memoryRequests.unshift(savedRequest);
    }

    res.status(201).json({
      success: true,
      message: 'Aid request submitted successfully and matched with top NGOs',
      data: savedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing aid request'
    });
  }
};

// @desc    Get all aid requests
// @route   GET /api/requests
// @access  Public
exports.getAllRequests = async (req, res) => {
  try {
    const { status, urgency, city } = req.query;

    if (isDBConnected()) {
      let query = {};
      if (status && status !== 'All') query.status = status;
      if (urgency && urgency !== 'All') query.urgency = urgency;
      if (city) query.city = { $regex: new RegExp(city, 'i') };

      const requests = await AidRequest.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: requests.length,
        data: requests
      });
    } else {
      let list = [...memoryRequests];
      if (status && status !== 'All') list = list.filter(r => r.status === status);
      if (urgency && urgency !== 'All') list = list.filter(r => r.urgency === urgency);
      if (city) list = list.filter(r => r.city.toLowerCase().includes(city.toLowerCase()));

      return res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching requests'
    });
  }
};

// @desc    Get single aid request by ID
// @route   GET /api/requests/:id
// @access  Public
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const request = await AidRequest.findById(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      return res.status(200).json({ success: true, data: request });
    } else {
      const found = memoryRequests.find(r => r._id === id);
      if (!found) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      return res.status(200).json({ success: true, data: found });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching request details'
    });
  }
};

// @desc    Update request status (e.g. NGO accepts or resolves)
// @route   PUT /api/requests/:id/status
// @access  Public
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const validStatuses = ['Pending', 'Matched', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    if (isDBConnected()) {
      const updateData = { status };
      if (status === 'Resolved') {
        updateData.resolvedAt = new Date();
      }
      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }

      const updated = await AidRequest.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } else {
      const found = memoryRequests.find(r => r._id === id);
      if (!found) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      found.status = status;
      if (status === 'Resolved') found.resolvedAt = new Date().toISOString();
      if (resolutionNotes) found.resolutionNotes = resolutionNotes;

      return res.status(200).json({ success: true, data: found });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating status'
    });
  }
};

// @desc    Live match preview without creating a database entry
// @route   POST /api/requests/match-preview
// @access  Public
exports.previewMatch = async (req, res) => {
  try {
    const { title, description, category, city, urgency } = req.body;
    const matches = await matchAidRequest({
      title: title || '',
      description: description || '',
      category: category || 'General Aid',
      city: city || '',
      urgency: urgency || 'Medium'
    }, 5);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating match preview'
    });
  }
};
