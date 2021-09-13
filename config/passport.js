const fs = require('fs')
const path = require('path')
const User = require('../models/user')

// Import passport-jwt
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt 

// Import public key
const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem')
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8')

// Set options
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // This extracts the jwt from the authorization http header
    secretOrKey: PUB_KEY,
    algorithms: ['RS256'] // Since we are using asymmetric encryption
}

const strategy = new JwtStrategy(options, (payload, done) => {
    // _id will be set to payload.sub on registration
    User.findOne({_id: payload.sub})
        .then(user => {
            if(user){
                return done(null, user)
            } else {
                return done(null, false)
            }
        })
        .catch(err => done(err, false))
})

module.exports = (passport) => {
    passport.use(strategy)
}