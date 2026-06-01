const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { reportedUser, reason, details } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: 'Reported user and reason are required' });
    }

    if (reportedUser === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    const userExists = await User.findById(reportedUser);

    if (!userExists) {
      return res.status(404).json({ message: 'Reported user not found' });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser,
      reason,
      details: details || '',
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/my
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate('reportedUser', 'name photo age gender location religion verificationStatus isVerified')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/admin/all
const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email photo')
      .populate('reportedUser', 'name email photo age gender location religion isActive verificationStatus isVerified')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/reports/admin/:id
const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid report status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Notification.create({
      user: report.reportedBy._id,
      type: 'report',
      title: 'Report Update',
      message: `Your report has been marked as ${status}.`,
      link: '/notifications',
    });

    res.json({
      message: 'Report status updated successfully',
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/reports/admin/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
  deleteReport,
};