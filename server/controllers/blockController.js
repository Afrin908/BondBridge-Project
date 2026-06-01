const Block = require('../models/Block');
const User = require('../models/User');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

// POST /api/blocks/:userId
const blockUser = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;

    if (blockedUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const userExists = await User.findById(blockedUserId);

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingBlock = await Block.findOne({
      blocker: req.user._id,
      blockedUser: blockedUserId,
    });

    if (existingBlock) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    const block = await Block.create({
      blocker: req.user._id,
      blockedUser: blockedUserId,
    });

    await Match.deleteMany({
      $or: [
        { sender: req.user._id, receiver: blockedUserId },
        { sender: blockedUserId, receiver: req.user._id },
      ],
    });

    res.status(201).json({
      message: 'User blocked successfully',
      block,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/blocks/:userId
const unblockUser = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;

    const block = await Block.findOneAndDelete({
      blocker: req.user._id,
      blockedUser: blockedUserId,
    });

    if (!block) {
      return res.status(404).json({ message: 'Block record not found' });
    }

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/blocks
const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user._id })
      .populate('blockedUser', 'name photo age gender location religion verificationStatus isVerified')
      .sort({ createdAt: -1 });

    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET helper: check if either user blocked the other
const isBlockedBetweenUsers = async (userId1, userId2) => {
  const block = await Block.findOne({
    $or: [
      { blocker: userId1, blockedUser: userId2 },
      { blocker: userId2, blockedUser: userId1 },
    ],
  });

  return !!block;
};

module.exports = {
  blockUser,
  unblockUser,
  getBlockedUsers,
  isBlockedBetweenUsers,
};