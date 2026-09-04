const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { getAuthorizedApps, launchApp, proxyBooksInvoices } = require('../controllers/zohoController');

router.use(verifyToken);

router.get('/apps', getAuthorizedApps);
router.post('/launch/:appKey', launchApp);
router.get('/proxy/books/invoices', proxyBooksInvoices);

module.exports = router;
