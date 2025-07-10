const express = require('express');
const router = express.Router();
const {createTeam, getAllTeams, getTeamById,updateTeam, deleteTeam,assignStudents,removeStudents} = require('../controllers/teams.js');
router.post('/', createTeam);
router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.patch('/:id/assign-students', assignStudents);
router.patch('/:id/remove-students', removeStudents);

module.exports = router;