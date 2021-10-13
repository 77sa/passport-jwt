require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const app = express()

// Database
try {
    mongoose.connect(process.env.MONGO_URI, {useNewUrlParser : true})
    console.log("Database connected")
} catch (error) {
    console.log(error)
}

// Passport library is passed into this module:
require('./config/passport')(passport)

// Middleware
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(passport.initialize())

// Routes
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log('Server started'))