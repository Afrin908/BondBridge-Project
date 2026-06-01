const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
  deleteReport,
} = require('../controllers/reportController');

router.post('/', protect, createReport);
router.get('/my', protect, getMyReports);

router.get('/admin/all', protect, adminOnly, getAllReports);
router.put('/admin/:id', protect, adminOnly, updateReportStatus);
router.delete('/admin/:id', protect, adminOnly, deleteReport);

module.exports = router;