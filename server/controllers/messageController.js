const Message = require('../models/Message');
const Match = require('../models/Match');
const Block = require('../models/Block');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

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

// Check if either user blocked the other
const isBlockedBetweenUsers = async (userId1, userId2) => {
  const block = await Block.findOne({
    $or: [
      { blocker: userId1, blockedUser: userId2 },
      { blocker: userId2, blockedUser: userId1 },
    ],
  });

  return !!block;
};

// @route POST /api/messages/send
const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and message content are required' });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver || !receiver.isActive) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    const blocked = await isBlockedBetweenUsers(req.user._id, receiverId);

    if (blocked) {
      return res.status(403).json({
        message: 'You cannot send messages because one user has blocked the other',
      });
    }

    const matched = await areMatched(req.user._id, receiverId);

    if (!matched) {
      return res.status(403).json({ message: 'You can only message matched users' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const populated = await message.populate('sender', 'name photo');

    await createNotification({
      user: receiverId,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name} sent you a message.`,
      link: `/chat/${req.user._id}`,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/messages/:userId
const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const blocked = await isBlockedBetweenUsers(req.user._id, otherUserId);

    if (blocked) {
      return res.status(403).json({
        message: 'You cannot view messages because one user has blocked the other',
      });
    }

    const matched = await areMatched(req.user._id, otherUserId);

    if (!matched) {
      return res.status(403).json({ message: 'Not matched with this user' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name photo');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};