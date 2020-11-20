const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const storage = require('./modules/storage');
const encrypt = require('./modules/cryptCompare');
const server = express();
const jwt = require('./modules/jwt'); 
const { decodeToken } = require('./modules/jwt');

server.use(bodyParser.json({limit: '50mb'}));
server.use(express.static('public'));

const credentials = require('./localenv').DATABASE_URL || process.env.DATABASE_URL;
const secret = require('./localenv').HASH_SECRET || process.env.HASH_SECRET;
const db = new storage(credentials);

/* **************** MIDDLEWARE ************************** */
const authenticator = async (req, res, next) => {
    //Basic http authentication for login
    console.log('Authenticating....');
    
    //If no authorization header:
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1){
        return res.append("WWW-Authenticate", 'Basic realm="User Visible Realm", charset="UTF-8"').status(401).end();
    }

    const credentials = req.headers.authorization.split(' ')[1];
    const [username, password] = Buffer.from(credentials, 'base64').toString('UTF-8').split(":");

    //Retrieve username and password from database
    let user, passwordFromDB;
    if(username){
        user = await db.getUser(username);
        if(user){
            passwordFromDB = user.password;
        } else {
            console.log('User does not exist');
            return;
        }  
    }
    
    //If password OK - login = ok
    if(encrypt.comparePasswords(encrypt.encryptPassword(password), passwordFromDB)){
        req.user = user;
        req.login = true;
        next();
    } else {
        console.log('d');
        req.login = false;
        next();
    } 
}

const authorizer = async (req, res, next) => {
    //If no authorization header:
    console.log('Authorizing....');
    if(!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1){
        return res.append("WWW-Authenticate", 'Bearer realm="User Visible Realm", charset="UTF-8"').status(401).end();
    }

    //Verify token
    let token = req.headers.authorization.split(' ')[1];
    let valid = jwt.validateToken(token);

    //If validation => next()
    if(valid){
        console.log('Authorized');
        next();
    } else {
        console.log('Unauthorized');
        res.status(401).end();
    }
}

/* ****************************************** */

server.post('/api/makePresentation', async (req, res) => {
    
    //Får inn i body: et JSON-objekt som inneholder tittel på presentasjonen
    let title = req.body.title;

    let presentation = {
        title: title,
        share: 0, //default value
        slides: []
    }

    //Får også inn et token i header, som inneholder brukernavn i payloaden
    let token = req.headers.authorization.split(' ')[1];

    let valid = jwt.validateToken(token);
    if(valid){
        let decodedPayload = decodeToken(token);
        let username = decodedPayload.username;
        
        let id = await db.addPresentation(username, presentation);
        
        if(id){
            res.status(200).json({id: id}).end();
        } else {
            res.status(500).end();
        }

    } else {
        res.status(403).end();
    }
});

server.post('/api/deletePresentation', async (req, res) => {
 

    res.status(200).json(response).end();
});

server.post('/api/updatePresentation', async (req, res) => {
 

    res.status(200).json(response).end();
});

server.post('/api/makeSlide', async (req, res) => {
    let presentation_id = req.body.presentation_id;

    //Får inn et token i header, som inneholder brukernavn i payloaden
    let token = req.headers.authorization.split(' ')[1];

    let valid = jwt.validateToken(token);
    if(valid){
        let result = await db.createSlide(presentation_id, req.body);
        
        if(result){
            res.status(200).end();
        } else {
            res.status(500).end();
        }

    } else {
        res.status(403).end();
    }
    
});

server.delete('/api/deleteSlide', async (req, res) => {
    //Får inn et token i header, som inneholder brukernavn i payloaden
    let token = req.headers.authorization.split(' ')[1];
    let valid = jwt.validateToken(token);
    if (valid) {
        const { slide_id, presentation_id } = req.query;
        let result = await db.deleteSlide(presentation_id, slide_id);
        
        if(result){
            res.status(200).end();
        } else {
            res.status(500).end();
        }
    } else {
        res.status(403).end();
    }
})

server.post('/api/deleteSlide', async (req, res) => {
 

    res.status(200).json(response).end();
});

server.post('/api/updateSlide', async (req, res) => {
 

    res.status(200).json(response).end();
});

server.post('/api/makeUser', async (req, res) => {
 
    let username = req.body.username;
    let password = req.body.password;

    //Hash password
    password = encrypt.encryptPassword(password);

    //Send info to database
    let result = await db.addUser(username, password);
    
    res.status(200).json(result).end();

    //res.status(200).json(response).end();
});

server.post('/api/deleteUser', async (req, res) => {
    //Kun innlogget bruker som kan slette seg selv.
    //Vil da også slette alle presentasjoner!

    //res.status(200).json(response).end();
});

server.post('/api/updateUser', async (req, res) => {


    res.status(200).json(response).end();
});

server.post('/api/sharePresentation', async (req, res) => {
    //Must require presentation ID
    let id = req.body.id;
    let share = req.body.share;

    //Får inn et token i header, som inneholder brukernavn i payloaden
    let token = req.headers.authorization.split(' ')[1];

    let valid = jwt.validateToken(token);
    if(valid){
        let result = await db.sharePresentation(id, share);
        if(result){
            res.status(200).end();
        } else {
            res.status(500).end();
        }

    } else {
        res.status(403).end();
    }

    //res.status(200).json(response).end();
});

server.get('/api/getPresentations', async (req, res)=>{
    //Får inn et token i header, som inneholder brukernavn i payloaden
    let token = req.headers.authorization.split(' ')[1];

    let valid = jwt.validateToken(token);
    if(valid){
        let decodedPayload = decodeToken(token);
        let username = decodedPayload.username;

        let result = await db.getPresentations(username);
        
        if(result){
            //console.log(result);
            res.status(200).json(result).end();
        } else {
            res.status(500).end();
        }

    } else {
        res.status(403).end();
    }
});

server.get('/api/validUsername', async (req, res)=>{
    let token = req.headers.authorization.split(' ')[1];

    let valid = jwt.validateToken(token);
    if(valid){
        let decodedPayload = decodeToken(token);
        let username = decodedPayload.username;
        res.status(200).json({username: username}).end();
       

    } else {
        res.status(403).end();
    }
});

server.get('/api/getSlides/:presentation_id', async (req, res)=>{
    //Får inn et token i header, som inneholder brukernavn i payloaden
    let token = req.headers.authorization.split(' ')[1];

    let valid = jwt.validateToken(token);
    if(valid){
        let result = await db.getSlides(req.params.presentation_id);
        
        if(result){
            res.status(200).json(result).end();
        } else {
            res.status(500).end();
        }

    } else {
        res.status(403).end();
    }
});

/* PRIVATE PAGES */
server.get('/random', authorizer, (req, res, next)=>{
    console.log('Welcome to random');
});

/* ALL ENDPOINTS THAT REQUIRE AUTHENTICATION */

//post eller get?
server.post('/api/login', authenticator, async (req, res) => {
    
    if(req.login){
        //If login successful - generate token to send along
        let token = jwt.generateToken({username: req.user.username});
        res.status(200).json(token);
    } else {
        console.log('f');
        res.status(403).send('Nope').end();
    }    
});

server.set('port', (process.env.PORT || 1234));
server.listen(server.get('port'), function() {
    console.log('server running', server.get('port'));
    
});