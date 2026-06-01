const User = require('../models/User');
const Match = require('../models/Match');

// Calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  const fields = [
    'name',
    'email',
    'age',
    'gender',
    'religion',
    'location',
    'maritalStatus',
    'education',
    'university',
    'profession',
    'bio',
    'photo',
  ];

  let completed = 0;

  fields.forEach((field) => {
    if (user[field]) completed += 1;
  });

  if (user.interests && user.interests.length > 0) completed += 1;
  if (user.lifestyle && Object.values(user.lifestyle).some(Boolean)) completed += 1;
  if (user.preferences && Object.values(user.preferences).some(Boolean)) completed += 1;

  return Math.round((completed / (fields.length + 3)) * 100);
};

// Check if two users are matched
const areMatched = async (userId1, userId2) => {
  const match = await Match.findOne({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 },
    ],
    status: 'accepted',
  });

  return !!match;
};

// Apply privacy rules for public profile view
const applyPrivacyRules = async (viewer, profile) => {
  const user = profile.toObject ? profile.toObject() : profile;
  const matched = await areMatched(viewer._id, user._id);

  if (user.privacy) {
    if (user.privacy.showPhoto === 'connected' && !matched) {
      user.photo = '';
    }

    if (user.privacy.showPhoto === 'verified' && viewer.verificationStatus !== 'verified') {
      user.photo = '';
    }

    if (user.privacy.showFullName === 'connected' && !matched) {
      user.name = 'BondBridge User';
    }

    if (user.privacy.showContact === 'hidden' || !matched) {
      delete user.email;
    }
  }

  return user;
};

// Interest overlap helper
const calculateInterestOverlap = (currentInterests = [], candidateInterests = []) => {
  if (!currentInterests.length || !candidateInterests.length) return 0;

  const current = currentInterests.map((i) => i.toLowerCase());
  const candidate = candidateInterests.map((i) => i.toLowerCase());

  const common = candidate.filter((item) => current.includes(item));
  return common.length / Math.max(current.length, candidate.length);
};

// Lifestyle score helper
const calculateLifestyleScore = (currentLifestyle = {}, candidateLifestyle = {}) => {
  const keys = ['smoking', 'diet', 'familyType', 'relocation'];
  let total = 0;
  let matched = 0;

  keys.forEach((key) => {
    if (currentLifestyle[key] && candidateLifestyle[key]) {
      total += 1;
      if (
        currentLifestyle[key].toLowerCase() ===
        candidateLifestyle[key].toLowerCase()
      ) {
        matched += 1;
      }
    }
  });

  return total === 0 ? 0 : matched / total;
};

// Compatibility score
const calculateCompatibility = (currentUser, candidate) => {
  let score = 0;

  if (
    candidate.age &&
    currentUser.preferences?.minAge &&
    currentUser.preferences?.maxAge &&
    candidate.age >= currentUser.preferences.minAge &&
    candidate.age <= currentUser.preferences.maxAge
  ) {
    score += 20;
  }

  if (
    currentUser.preferences?.location &&
    candidate.location &&
    candidate.location.toLowerCase().includes(currentUser.preferences.location.toLowerCase())
  ) {
    score += 15;
  }

  if (
    currentUser.preferences?.education &&
    candidate.education &&
    candidate.education.toLowerCase().includes(currentUser.preferences.education.toLowerCase())
  ) {
    score += 15;
  }

  if (
    currentUser.preferences?.religion &&
    candidate.religion &&
    candidate.religion.toLowerCase() === currentUser.preferences.religion.toLowerCase()
  ) {
    score += 20;
  }

  score += calculateInterestOverlap(currentUser.interests, candidate.interests) * 15;
  score += calculateLifestyleScore(currentUser.lifestyle, candidate.lifestyle) * 10;

  if (candidate.verificationStatus === 'verified' || candidate.isVerified) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
};

// GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.lastActive = new Date();
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/me
const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'age',
      'gender',
      'religion',
      'location',
      'maritalStatus',
      'education',
      'university',
      'profession',
      'occupation',
      'bio',
      'photo',
      'skills',
      'expertiseAreas',
      'collaborationGoals',
      'communicationPreferences',
      'availabilityStatus',
      'employeeId',
      'userType',
      'organization',
      'department',
      'roleTitle',
      'workMode',
      'interests',
      'lifestyle',
      'preferences',
      'privacy',
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const existingUser = await User.findById(req.user._id);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.assign(existingUser, updates);
    existingUser.profileCompletion = calculateProfileCompletion(existingUser);
    existingUser.lastActive = new Date();

    await existingUser.save();

    const user = await User.findById(req.user._id).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const viewer = await User.findById(req.user._id).select('-password');
    const user = await User.findById(req.params.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    const privacySafeUser = await applyPrivacyRules(viewer, user);

    res.json(privacySafeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const Block = require('../models/Block');

    const {
      gender,
      religion,
      location,
      organization,
      department,
      roleTitle,
      search,
      skill,
      maritalStatus,
      education,
      profession,
      occupation,
      minAge,
      maxAge,
      name,
      verifiedOnly,
      interests,
      sortBy,
    } = req.query;

    const currentUser = await User.findById(req.user._id).select('-password');

    // Get blocked relationships
    const blocks = await Block.find({
      $or: [
        { blocker: req.user._id },
        { blockedUser: req.user._id },
      ],
    });

    const blockedUserIds = blocks.map((block) => {
      return block.blocker.toString() === req.user._id.toString()
        ? block.blockedUser.toString()
        : block.blocker.toString();
    });

    const filter = {
      _id: {
        $nin: [req.user._id, ...blockedUserIds],
      },
      isActive: true,
    };

    if (gender) filter.gender = gender;

    if (religion) {
      filter.religion = {
        $regex: religion,
        $options: 'i',
      };
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: 'i',
      };
    }

    if (organization) {
      filter.organization = { $regex: organization, $options: 'i' };
    }

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    if (roleTitle) {
      filter.roleTitle = { $regex: roleTitle, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { expertiseAreas: { $regex: search, $options: 'i' } },
      ];
    }

    if (skill) {
      filter.$or = [
        ...(filter.$or || []),
        { skills: { $regex: skill, $options: 'i' } },
        { expertiseAreas: { $regex: skill, $options: 'i' } },
        { interests: { $regex: skill, $options: 'i' } },
      ];
    }

    if (maritalStatus) {
      filter.maritalStatus = maritalStatus;
    }

    if (education) {
      filter.education = {
        $regex: education,
        $options: 'i',
      };
    }

    if (profession) {
      filter.profession = {
        $regex: profession,
        $options: 'i',
      };
    }

    if (occupation) {
      filter.occupation = {
        $regex: occupation,
        $options: 'i',
      };
    }

    if (name) {
      filter.name = {
        $regex: name,
        $options: 'i',
      };
    }

    if (verifiedOnly === 'true') {
      filter.$or = [
        { verificationStatus: 'verified' },
        { isVerified: true },
      ];
    }

    if (minAge || maxAge) {
      filter.age = {};

      if (minAge) {
        filter.age.$gte = parseInt(minAge);
      }

      if (maxAge) {
        filter.age.$lte = parseInt(maxAge);
      }
    }

    if (interests) {
      const interestArray = interests
        .split(',')
        .map((item) => item.trim());

      filter.interests = {
        $in: interestArray,
      };
    }

    let users = await User.find(filter)
      .select('-password -email')
      .limit(100);

    users = users.map((user) => {
      const userObject = user.toObject();

      userObject.compatibilityScore = calculateCompatibility(
        currentUser,
        userObject
      );

      // Privacy: verified-only photo
      if (
        userObject.privacy?.showPhoto === 'verified' &&
        currentUser.verificationStatus !== 'verified'
      ) {
        userObject.photo = '';
      }

      // Privacy: matched-only full name
      if (userObject.privacy?.showFullName === 'connected') {
        userObject.name = 'BondBridge User';
      }

      return userObject;
    });

    // Default sorting: compatibility
    if (!sortBy || sortBy === 'compatibility') {
      users.sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore
      );
    }

    if (sortBy === 'newest') {
      users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    if (sortBy === 'ageLow') {
      users.sort((a, b) => (a.age || 0) - (b.age || 0));
    }

    if (sortBy === 'ageHigh') {
      users.sort((a, b) => (b.age || 0) - (a.age || 0));
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PUT /api/users/verification/submit
const submitVerification = async (req, res) => {
  try {
    const { note, verificationDocuments } = req.body;

    const nidFront = verificationDocuments?.nidFront || '';
    const nidBack = verificationDocuments?.nidBack || '';
    const selfieWithNid = verificationDocuments?.selfieWithNid || '';

    if (!nidFront || !nidBack || !selfieWithNid) {
      return res.status(400).json({
        message: 'NID front, NID back, and selfie with NID are required for verification.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        verificationStatus: 'pending',
        verificationDocuments: {
          nidFront,
          nidBack,
          selfieWithNid,
        },
        verificationNote: note || 'Identity verification requested by user',
        verificationSubmittedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Verification request submitted successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/admin/verifications
const getVerificationRequests = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'pending' })
      .select('-password')
      .sort({ verificationSubmittedAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/admin/verifications/:id
const updateVerificationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!['verified', 'rejected', 'unverified'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const updates = {
      verificationStatus: status,
      verificationNote: note || '',
      isVerified: status === 'verified',
    };

    if (status === 'verified') {
      updates.verifiedAt = new Date();
    }

    if (status === 'rejected') {
      updates.verifiedAt = null;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User verification status updated to ${status}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/all  admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const suspendedUsers = await User.countDocuments({ isActive: false });
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });

    res.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      pendingVerifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id/suspend  admin
const suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id/unsuspend  admin
const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User unsuspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserById,
  searchUsers,
  submitVerification,
  getVerificationRequests,
  updateVerificationStatus,
  getAllUsers,
  getAdminStats,
  suspendUser,
  unsuspendUser,
};