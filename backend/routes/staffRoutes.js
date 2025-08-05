const express = require('express');
const router = express.Router();
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  changeStaffPassword
} = require('../controllers/staffController');
const { protect, adminOnly } = require('../middlewares/auth');

// Public routes for testing (remove in production)
router.get('/test', (req, res) => {
  res.json({ message: 'Staff routes are working!' });
});

router.post('/test-create', createStaff);

// Routes accessible by authenticated users (temporarily without auth for testing)
router.get('/stats', getStaffStats);
router.get('/', getAllStaff);

// Routes accessible only by admins (temporarily without auth for testing)
router.post('/', createStaff);

// Password change route (must come before /:id route)
router.put('/:id/change-password', (req, res, next) => {
  console.log('🎯 Password change route hit!');
  console.log('🔍 Route params:', req.params);
  console.log('🔍 Route body:', req.body);
  next();
}, changeStaffPassword);



// Parameterized routes must come after specific routes
router.get('/:id', getStaffById);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
