const NGO = require('../models/NGO');
const { isDBConnected } = require('../config/db');
const { loadCSVNGOs } = require('../services/mlService');

// @desc    Get all NGOs with optional filtering and search
// @route   GET /api/ngos
// @access  Public
exports.getAllNGOs = async (req, res) => {
  try {
    const { category, sector, city, location, search, verified } = req.query;

    if (isDBConnected()) {
      let query = {};

      const catFilter = category || sector;
      if (catFilter && catFilter !== 'All') {
        const catRegex = new RegExp(catFilter, 'i');
        query.$or = [
          { category: catRegex },
          { sectors: catRegex },
          { helps: catRegex }
        ];
      }

      const locFilter = city || location;
      if (locFilter && locFilter !== 'All') {
        const locRegex = new RegExp(locFilter, 'i');
        const locConditions = [
          { city: locRegex },
          { location: locRegex },
          { areas_served: locRegex }
        ];
        if (query.$or) {
          query.$and = [
            { $or: query.$or },
            { $or: locConditions }
          ];
          delete query.$or;
        } else {
          query.$or = locConditions;
        }
      }

      if (verified !== undefined) {
        query.verified = verified === 'true';
      }

      if (search) {
        const sRegex = new RegExp(search, 'i');
        const searchConditions = [
          { name: sRegex },
          { description: sRegex },
          { category: sRegex },
          { sectors: sRegex },
          { helps: sRegex },
          { services: sRegex },
          { location: sRegex },
          { registration_number: sRegex }
        ];

        if (query.$and) {
          query.$and.push({ $or: searchConditions });
        } else if (query.$or) {
          query.$and = [
            { $or: query.$or },
            { $or: searchConditions }
          ];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      }

      let ngos = await NGO.find(query).sort({ rating: -1, name: 1 });

      return res.status(200).json({
        success: true,
        count: ngos.length,
        data: ngos
      });
    } else {
      // Offline / in-memory fallback
      let list = loadCSVNGOs();

      const catFilter = (category || sector || '').toLowerCase();
      if (catFilter && catFilter !== 'all') {
        list = list.filter(n => {
          const inCat = (n.category || '').toLowerCase().includes(catFilter);
          const inSectors = Array.isArray(n.sectors)
            ? n.sectors.some(s => s.toLowerCase().includes(catFilter))
            : (n.sectors || '').toLowerCase().includes(catFilter);
          const inHelps = Array.isArray(n.helps)
            ? n.helps.some(h => h.toLowerCase().includes(catFilter))
            : (n.helps || '').toLowerCase().includes(catFilter);
          return inCat || inSectors || inHelps;
        });
      }

      const locFilter = (city || location || '').toLowerCase();
      if (locFilter && locFilter !== 'all') {
        list = list.filter(n => {
          const inCity = (n.city || '').toLowerCase().includes(locFilter);
          const inLoc = (n.location || '').toLowerCase().includes(locFilter);
          const inAreas = Array.isArray(n.areas_served)
            ? n.areas_served.some(a => a.toLowerCase().includes(locFilter))
            : (n.areas_served || '').toLowerCase().includes(locFilter);
          return inCity || inLoc || inAreas;
        });
      }

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(n => {
          const nameMatch = (n.name || '').toLowerCase().includes(s);
          const descMatch = (n.description || '').toLowerCase().includes(s);
          const catMatch = (n.category || '').toLowerCase().includes(s);
          const locMatch = (n.location || '').toLowerCase().includes(s);
          const regMatch = (n.registration_number || '').toLowerCase().includes(s);
          return nameMatch || descMatch || catMatch || locMatch || regMatch;
        });
      }

      return res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching NGOs'
    });
  }
};

// @desc    Get single NGO by ID or registration number
// @route   GET /api/ngos/:id
// @access  Public
exports.getNGOById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      let ngo = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        ngo = await NGO.findById(id);
      }
      if (!ngo) {
        ngo = await NGO.findOne({
          $or: [
            { registration_number: id },
            { name: new RegExp(`^${id}$`, 'i') }
          ]
        });
      }
      if (!ngo) {
        return res.status(404).json({ success: false, message: 'NGO not found' });
      }
      return res.status(200).json({ success: true, data: ngo });
    } else {
      const list = loadCSVNGOs();
      const found = list.find(n =>
        String(n.ngo_id) === String(id) ||
        String(n.registration_number) === String(id) ||
        (n.name || '').toLowerCase() === id.toLowerCase()
      );
      if (!found) {
        return res.status(404).json({ success: false, message: 'NGO not found' });
      }
      return res.status(200).json({ success: true, data: found });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching NGO'
    });
  }
};

// @desc    Create new NGO profile
// @route   POST /api/ngos
// @access  Private
exports.createNGO = async (req, res) => {
  try {
    if (isDBConnected()) {
      const ngo = await NGO.create(req.body);
      return res.status(201).json({ success: true, data: ngo });
    } else {
      const newNGO = {
        ngo_id: Date.now(),
        ...req.body,
        verified: true,
        rating: 4.7
      };
      return res.status(201).json({ success: true, data: newNGO });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating NGO'
    });
  }
};

// @desc    Seed NGOs from CSV or dataset
// @route   POST /api/ngos/seed
// @access  Public
exports.seedNGOs = async (req, res) => {
  try {
    const list = loadCSVNGOs();
    if (isDBConnected() && list.length > 0) {
      await NGO.deleteMany({});
      await NGO.insertMany(list);
    }

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${list.length} NGOs`,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed NGOs'
    });
  }
};
