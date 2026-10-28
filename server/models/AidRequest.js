const mongoose = require('mongoose');

const aidRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an aid request title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please describe the emergency or aid needed']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General Aid'
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    requesterName: {
      type: String,
      required: [true, 'Requester name is required']
    },
    requesterPhone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    requesterEmail: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    matchedNGOs: [
      {
        ngoId: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        category: String,
        city: String,
        contactPhone: String,
        contactEmail: String,
        matchScore: Number,
        breakdown: Object,
        status: {
          type: String,
          enum: ['Suggested', 'Notified', 'Accepted', 'Declined'],
          default: 'Suggested'
        }
      }
    ],
    assignedNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null
    },
    targetNgoName: {
      type: String,
      default: ''
    },
    isDirectRequest: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Pending', 'Matched', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending'
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AidRequest', aidRequestSchema);
