const express = require('express')
const router = express.Router()
const authController = require('../Controller/AuthController')

router.post('/login',authController.adminLogin)

module.exports = router