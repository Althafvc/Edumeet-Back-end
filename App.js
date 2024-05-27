const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const port = process.env.port|| 3000

const commonRouter = require ('./Router/Auth')
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use('/api/student',commonRouter)

mongoose.connect('mongodb://0.0.0.0:27017/edumeet')
    .then(() => {
        app.listen(port, () => console.log(`server is running on localhost ${port}`))
        console.log('Database connected');
    }).catch((error) => console.log('connection error', error));

