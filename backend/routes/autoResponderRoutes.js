const express = require('express');
const controller = require('../controllers/autoResponderController');
const router = express.Router();

router.post('/rule', controller.addRule);
router.get('/rules', controller.getRules);
router.put('/rule/:id', controller.updateRule);
router.delete('/rule/:id', controller.deleteRule);


module.exports = router;