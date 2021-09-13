require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const app = express()

// Database
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser : true})
const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.once('open', () => console.log('Database connected'))

// Passport library is passed into this module:
require('./config/passport')(passport)

// Middleware
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(passport.initialize())

// Routes
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log('Server started'))