const express = require('express');
const router = express.Router();
const {createExperiment, getAllExperiments, getExperimentById, updateExperiment, deleteExperiment} = require('../controllers/experiments.js');
router.post('/', createExperiment);
router.get('/', getAllExperiments);
router.get('/:id', getExperimentById);
router.patch('/:id', updateExperiment);
router.delete('/:id', deleteExperiment);
module.exports = router;