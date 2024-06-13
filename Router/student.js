const express = require('express')
const router = express.Router()
const authController = require ('../Controller/AuthController')

router.post('/signup',authController.studentSignup)
router.post('/login',authController.studentLogin)
router.post('/otp',authController.studentOtp)



module.exports = router 