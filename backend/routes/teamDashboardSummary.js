const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const TeamDashboardSummary = require('../controllers/teamDashboardSummary.js');


// All routes require auth
router.use(auth);

// List or fetch-by-parent
// GET /api/discussionThread?parentType=Bug[&parentId=<id>]
router.get('/teamSummary', TeamDashboardSummary);



module.exports = router;
