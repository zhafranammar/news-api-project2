const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const newController = require('../controller/newController');
const authenticate = require('../middleware/authenticate');

// Auth router
router.post('/register', authController.register)
router.post('/login', authController.login)


// Auth news
router.get('/news', authenticate, newController.getAllNews);
router.get('/news/me', authenticate, newController.getNewsByAuthor);
router.get('/news/:id', authenticate, newController.getNewById);
router.post('/news', authenticate, newController.createNew);
router.put('/news/:id', authenticate, newController.updateNew);
router.delete('/news/:id', authenticate, newController.deleteNew);

module.exports = router;
