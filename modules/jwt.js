//https://jwt.io/

const tokenSecret = require('../localenv').TOKEN_SECRET;
const crypto = require('crypto');

function generateToken(payload){
    //Header
    const header = {
        'alg': 'HS256',
        'typ': 'jwt'
    }

    const headerBUF = Buffer.from(JSON.stringify(header), 'utf-8');
    const headerENC = urlEncode(headerBUF.toString('base64'));
    
    //Payload
    const payloadBUF = Buffer.from(JSON.stringify(payload), 'utf-8');
    const payloadENC = urlEncode(payloadBUF.toString('base64'));

    //Signature
    const signString = headerENC+"."+payloadENC;

    const sign = signToken(signString);

    //Finished token
    const token = headerENC+"."+payloadENC+"."+sign;
    return token;
}

function validateToken(token){
    //Step 1: Split token at .
    let [header, payload, sign] = token.split('.');
    
    //Create signature
    const signString = header+"."+payload;
    const mySignature = signToken(signString);

    //Check if mySignature matches the signature from the received token
    return mySignature === sign;

    
}

function signToken(signString){
    return urlEncode(crypto.createHmac('sha256', tokenSecret)
    .update(signString, 'utf-8')
    .digest('base64'));
}

//Actually a base64url encoder
// https://base64.guru/standards/base64url
// https://medium.com/better-programming/a-practical-guide-for-jwt-authentication-using-nodejs-and-express-d48369e7e6d4
function urlEncode(encodedString){
    return urlEncoded = encodedString.replace(/=/g, "")                      
    .replace(/\+/g, "-")                               
    .replace(/\//g, "_");
}

module.exports = {
    generateToken, 
    validateToken
};