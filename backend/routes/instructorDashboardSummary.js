const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const InstructorDashboardSummary = require('../controllers/instructorDashboardSummary.js');


// All routes require auth
router.use(auth);

// List or fetch-by-parent
// GET /api/discussionThread?parentType=Bug[&parentId=<id>]
router.get('/summary', InstructorDashboardSummary);



module.exports = router;
