const express = require('express')
const router = express.Router()
const authController = require('../Controller/AuthController')

router.post('/verifyemail',authController.verifyEmail)
router.post('/forgototp',authController.forgotOtp)
router.post('/passwordchange',authController.changePassword)

module.exports = router