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

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({success: true, msg: 'You are authorized to visit this page.'})
})

// Login and register
router.post('/register', async (req, res) => {
    const {username, email, password} = req.body

    if(!username || !email || !password) return res.send({message: 'Please complete the form'})

    if(await User.findOne({email})) return res.send({message: "Email already registered"})
    if(await User.findOne({username})) return res.send({message: "Username is taken"})
    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({username, email, password: hashedPassword})

        const jwt = issueJWT(user)

        res.json({success: true, user, token: jwt.token, expiresIn: jwt.expires})
    } catch (error) {
        res.status(500).send({message: "Server error"})
    }

    //     User.findOne({email:email})
    //         .then(async user => {
    //             if(user){
    //                 // Account already exists
    //                 errors.push({message: 'Email already in use'})
    //                 res.send([...errors])
    //             } else {
    //                 // Saving new user
    //                 const hashedPassword = await bcrypt.hash(password, 10)

    //                 const newUser = new User({
    //                     username,
    //                     email,
    //                     password: hashedPassword
    //                 })
    //                 newUser.save()
    //                     .then(user => {
    //                         const jwt = issueJWT(user)

    //                         res.json({ success: true, user, token: jwt.token, expiresIn: jwt.expires})
    //                     })
    //                     .catch(err => console.log(err))
    //             }
    //         })
    // }
})

router.post('/login', (req, res) => {
    const {username, password} = req.body

    let errors = []

    User.findOne({username:username})
        .then(async user => {
            if(!user){
                // No account
                errors.push({message: 'Account does not exist'})
                res.json([...errors])
            } else {
                try {
                    if(await bcrypt.compare(password, user.password)){
                        // Password match
                        const jwt = issueJWT(user)

                        res.json({ success: true, user, token: jwt.token, expiresIn: jwt.expires})
                    } else {
                        // Wrong password
                        errors.push({message: 'Wrong password'})
                        res.json([...errors])
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