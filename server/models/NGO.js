const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true
    },
    registration_number: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    city: {
      type: String,
      default: '',
      trim: true
    },
    state: {
      type: String,
      default: 'Karnataka',
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'General Aid',
      trim: true
    },
    sectors: {
      type: [String],
      default: []
    },
    helps: {
      type: [String],
      default: []
    },
    services: {
      type: [String],
      default: []
    },
    areas_served: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: ''
    },
    phone: {
      type: [String],
      default: []
    },
    email: {
      type: [String],
      default: []
    },
    contactPhone: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    social_media: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    sources: {
      type: [String],
      default: []
    },
    keywords: {
      type: [String],
      default: []
    },
    capacity: {
      type: Number,
      default: 1000
    },
    urgencyLevelsHandled: {
      type: [String],
      default: ['Low', 'Medium', 'High', 'Critical']
    },
    verified: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: null
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    activeCases: {
      type: Number,
      default: 0
    },
    resolvedCases: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Comprehensive Text index for search across all new and existing fields
ngoSchema.index({
  name: 'text',
  description: 'text',
  sectors: 'text',
  helps: 'text',
  services: 'text',
  location: 'text',
  category: 'text',
  keywords: 'text'
});

ngoSchema.index({ city: 1 });
ngoSchema.index({ category: 1 });
ngoSchema.index({ sectors: 1 });
ngoSchema.index({ registration_number: 1 });

module.exports = mongoose.model('NGO', ngoSchema);
