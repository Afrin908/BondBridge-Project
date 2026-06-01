const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
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
} = require('../controllers/userController');

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

router.get('/search', protect, searchUsers);

router.put('/verification/submit', protect, submitVerification);

router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/admin/verifications', protect, adminOnly, getVerificationRequests);
router.put('/admin/verifications/:id', protect, adminOnly, updateVerificationStatus);

router.get('/all', protect, adminOnly, getAllUsers);
router.put('/:id/suspend', protect, adminOnly, suspendUser);
router.put('/:id/unsuspend', protect, adminOnly, unsuspendUser);

router.get('/:id', protect, getUserById);

module.exports = router;