const tokenSecret = process.env.TOKEN_SECRET;
const crypto = require('crypto');

function generateToken(payload){
    const header = {
        'alg': 'HS256',
        'typ': 'jwt'
    }

    const headerBUF = Buffer.from(JSON.stringify(header), 'utf-8');
    const headerENC = urlEncode(headerBUF.toString('base64'));
    
    const payloadBUF = Buffer.from(JSON.stringify(payload), 'utf-8');
    const payloadENC = urlEncode(payloadBUF.toString('base64'));

    const signString = headerENC+"."+payloadENC;
    const sign = signToken(signString);

    const token = headerENC+"."+payloadENC+"."+sign;
    return token;
}

function validateToken(token){
    let [header, payload, sign] = token.split('.');
    
    const signString = header+"."+payload;
    const mySignature = signToken(signString);

    return mySignature === sign;    
}

function decodeToken(token){
    let encodedPayload = token.split('.')[1];    
    let payloadBUF = Buffer.from(encodedPayload, 'base64');
    let payload = payloadBUF.toString('utf8');
    return JSON.parse(payload);
}

function signToken(signString){
    return urlEncode(crypto.createHmac('sha256', tokenSecret)
    .update(signString, 'utf-8')
    .digest('base64'));
}

function urlEncode(encodedString){
    return urlEncoded = encodedString.replace(/=/g, "")                      
    .replace(/\+/g, "-")                               
    .replace(/\//g, "_");
}

module.exports = {
    generateToken, 
    validateToken,
    decodeToken
};