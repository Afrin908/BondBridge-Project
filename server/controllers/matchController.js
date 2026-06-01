const Match = require('../models/Match');
const User = require('../models/User');
const Block = require('../models/Block');
const { createNotification } = require('./notificationController');

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

// @route POST /api/match/request
const sendRequest = async (req, res) => {
  const { receiverId } = req.body;

  try {
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver || !receiver.isActive) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    const blocked = await isBlockedBetweenUsers(req.user._id, receiverId);

    if (blocked) {
      return res.status(403).json({
        message: 'You cannot send request because one user has blocked the other',
      });
    }

    const existing = await Match.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    const match = await Match.create({
      sender: req.user._id,
      receiver: receiverId,
    });

    await createNotification({
      user: receiverId,
      type: 'match_request',
      title: 'New Match Request',
      message: `${req.user.name} sent you a match request.`,
      link: '/requests',
    });

    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/match/requests
const getIncomingRequests = async (req, res) => {
  try {
    const blocks = await Block.find({
      $or: [{ blocker: req.user._id }, { blockedUser: req.user._id }],
    });

    const blockedIds = blocks.map((block) =>
      block.blocker.toString() === req.user._id.toString()
        ? block.blockedUser.toString()
        : block.blocker.toString()
    );

    const requests = await Match.find({
      receiver: req.user._id,
      status: 'pending',
      sender: { $nin: blockedIds },
    }).populate(
      'sender',
      'name photo age location religion gender verificationStatus isVerified'
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/match/sent
const getSentRequests = async (req, res) => {
  try {
    const requests = await Match.find({ sender: req.user._id }).populate(
      'receiver',
      'name photo age location religion gender verificationStatus isVerified'
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/match/:id/respond
const respondToRequest = async (req, res) => {
  const { status } = req.body;

  try {
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const match = await Match.findOne({
      _id: req.params.id,
      receiver: req.user._id,
    }).populate('sender', 'name email');

    if (!match) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const blocked = await isBlockedBetweenUsers(req.user._id, match.sender._id);

    if (blocked) {
      return res.status(403).json({
        message: 'You cannot respond because one user has blocked the other',
      });
    }

    match.status = status;
    await match.save();

    await createNotification({
      user: match.sender._id,
      type: status === 'accepted' ? 'match_accepted' : 'match_rejected',
      title: status === 'accepted' ? 'Match Request Accepted' : 'Match Request Rejected',
      message:
        status === 'accepted'
          ? `${req.user.name} accepted your match request.`
          : `${req.user.name} rejected your match request.`,
      link: status === 'accepted' ? '/connections' : '/requests',
    });

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/match/connections
const getConnections = async (req, res) => {
  try {
    const blocks = await Block.find({
      $or: [{ blocker: req.user._id }, { blockedUser: req.user._id }],
    });

    const blockedIds = blocks.map((block) =>
      block.blocker.toString() === req.user._id.toString()
        ? block.blockedUser.toString()
        : block.blocker.toString()
    );

    const matches = await Match.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted',
    })
      .populate(
        'sender',
        'name photo age location religion gender verificationStatus isVerified'
      )
      .populate(
        'receiver',
        'name photo age location religion gender verificationStatus isVerified'
      );

    const connections = matches
      .map((match) => {
        const isReceiver =
          match.receiver._id.toString() === req.user._id.toString();

        const otherUser = isReceiver ? match.sender : match.receiver;

        return {
          matchId: match._id,
          user: otherUser,
          matchedAt: match.updatedAt,
        };
      })
      .filter((connection) => {
        return !blockedIds.includes(connection.user._id.toString());
      });

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/match/:id
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findOneAndDelete({
      _id: req.params.id,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ message: 'Match removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRequest,
  getIncomingRequests,
  getSentRequests,
  respondToRequest,
  getConnections,
  deleteMatch,
};