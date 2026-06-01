const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Fake Profile',
        'Harassment',
        'Inappropriate Content',
        'Spam',
        'Scam or Fraud',
        'Other',
        'Professional conduct concern',
'Identity verification concern',
'Unsafe communication',
'Scammer',
      ],
    },

    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);