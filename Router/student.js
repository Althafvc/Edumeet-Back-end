const express = require('express')
const router = express.Router()
const authController = require ('../Controller/AuthController')

router.post('/signup',authController.studentSignup)
router.post('/login',authController.studentLogin)


module.exports = router 