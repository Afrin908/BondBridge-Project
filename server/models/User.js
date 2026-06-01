const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    employeeId: { type: String, trim: true },
    userType: {
      type: String,
      enum: ['employee', 'client', 'vendor', 'partner', 'external'],
      default: 'employee',
    },
    organization: { type: String, trim: true },
    department: { type: String, trim: true },
    roleTitle: { type: String, trim: true },
    profession: { type: String, trim: true },
    occupation: { type: String, trim: true },
    location: { type: String, trim: true },
    workMode: { type: String, enum: ['onsite', 'remote', 'hybrid', ''], default: '' },

    bio: { type: String, maxlength: 500 },
    photo: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    expertiseAreas: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    collaborationGoals: [{ type: String, trim: true }],
    communicationPreferences: [{ type: String, trim: true }],
    availabilityStatus: {
      type: String,
      enum: ['available', 'focused', 'busy', 'away'],
      default: 'available',
    },

    privacy: {
      showPhoto: { type: String, enum: ['public', 'connected', 'verified'], default: 'public' },
      showContact: { type: String, enum: ['connected', 'hidden'], default: 'connected' },
      showFullName: { type: String, enum: ['public', 'connected'], default: 'public' },
    },

    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    verificationDocuments: {
      nidFront: { type: String, default: '' },
      nidBack: { type: String, default: '' },
      selfieWithNid: { type: String, default: '' },
    },
    verificationNote: { type: String, default: '' },
    verificationSubmittedAt: { type: Date },
    verifiedAt: { type: Date },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    lastActive: { type: Date },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ organization: 1 });
userSchema.index({ department: 1 });
userSchema.index({ roleTitle: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ location: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
