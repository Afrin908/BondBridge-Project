const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  blockUser,
  unblockUser,
  getBlockedUsers,
} = require('../controllers/blockController');

router.get('/', protect, getBlockedUsers);
router.post('/:userId', protect, blockUser);
router.delete('/:userId', protect, unblockUser);

module.exports = router;