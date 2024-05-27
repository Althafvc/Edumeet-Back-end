const express = require('express')
const router = express.Router()

const commonController = require('../Controller/AuthController')

router.post('/signup',commonController.defaultRoute)

module.exports = router