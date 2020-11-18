//https://jwt.io/

const tokenSecret = 'forTesting';
const crypto = require('crypto');

let token = generateToken({username: 'fancyBoi'});
//let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.eyJ1c2VybmFtZSI6ImZhbmN5Qm9pIn0.00PpVqFox0Nk4s1AmeO0kn4T9V2VTyC1rwXd99lKZkM';
console.log(token);
decodeToken(token);

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

function decodeToken(token){
    //Get payload
    let encodedPayload = token.split('.')[1];
    let payloadBUF = Buffer.from(encodedPayload, 'base64');
    let payload = payloadBUF.toString('utf-8');
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