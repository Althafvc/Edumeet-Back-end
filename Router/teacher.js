const express = require('express')
const router = express.Router()
const authController = require('../Controller/AuthController')

router.post('/signup',authController.teacherSignup)

module.exports = router