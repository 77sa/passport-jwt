const crypto = require('crypto')
const fs = require('fs')

function genKeyPair()
{
    // Type of algorithm, options, public and private key encoding
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, // Bits, 4096 is the standard
        publicKeyEncoding: {
            type: 'pkcs1', // Public Key Cryptography Standard 1
            format: 'pem' // Most common format
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    })

    // Creating the .pem files:
    fs.writeFileSync(__dirname + '/id_rsa_pub.pem', keyPair.publicKey)

    fs.writeFileSync(__dirname + '/id_rsa_priv.pem', keyPair.privateKey)
}

genKeyPair()
