const express = require('express')
const path = require('path')
const fs = require('fs')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const router = express.Router()

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem')
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8')

// Render: 
router.get('/register', (req, res) => {
    res.render('register.ejs')
})

router.get('/login', (req, res) => {
    res.render('login.ejs')
})

// Passport authenticate middleware will call the verify callback in our config file.
// Session is false since we are not using express-session. 
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(200).json({success: true, msg: 'You are authorized to visit this page.'})
})

// Post requests:

router.post('/register', (req, res) => {
    const {username, email, password} = req.body

    let errors = []

    if(!username || !email || !password){
        errors.push({message: 'Please complete the form'})
    }

    if(errors > 0){
        res.render('register.ejs', {
            errors,
            username,
            email,
            password
        })
    } else {
        User.findOne({email:email})
            .then(async user => {
                if(user){
                    // Account already exists
                    errors.push({message: 'Email already in use'})
                    res.render('register.ejs', {
                        errors,
                        username,
                        email,
                        password
                    })
                } else {
                    // Saving new user
                    const hashedPassword = await bcrypt.hash(password, 10)

                    const newUser = new User({
                        username,
                        email,
                        password: hashedPassword
                    })
                    newUser.save()
                        .then(user => {
                            const jwt = issueJWT(user)

                            res.json({ success: true, user, token: jwt.token, expiresIn: jwt.expires})
                        })
                        .catch(err => console.log(err))
                }
            })
    }
    
})

router.post('/login', (req, res) => {
    const {username, password} = req.body

    let errors = []

    User.findOne({username:username})
        .then(async user => {
            if(!user){
                // No account
                errors.push({message: 'Account does not exist'})
                res.render('login.ejs', {
                    errors,
                    username,
                    password
                })
            } else {
                try {
                    if(await bcrypt.compare(password, user.password)){
                        // Password match
                        const jwt = issueJWT(user)

                        res.json({ success: true, user, token: jwt.token, expiresIn: jwt.expires})
                    } else {
                        // Wrong password
                        errors.push({message: 'Wrong password'})
                        res.render('login.ejs', {
                            errors,
                            username,
                            password
                        })
                    }
                } catch (err){
                    console.log(err)
                }
            }
        })
})

function issueJWT(user){
    const _id = user._id

    const expiresIn = '1d'

    const payload = {
        sub: _id,
        iat: Date.now()
    }

    const signedToken = jwt.sign(payload, PRIV_KEY, {expiresIn, algorithm: 'RS256'})

    return {
        token: 'Bearer ' + signedToken,
        expires: expiresIn
    }
}

module.exports = router