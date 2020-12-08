const crypto = require('crypto');
const secret =  process.env.HASH_SECRET;

function encryptPassword(password){

    let encrypted = crypto.createHmac('sha256', secret)
    .update(password)
    .digest('hex');

    return encrypted;
}

function comparePasswords(password1, password2){
    return (password1 === password2)
}

module.exports = {
    encryptPassword,
    comparePasswords
}