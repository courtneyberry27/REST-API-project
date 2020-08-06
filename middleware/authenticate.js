//IMPORTS
const auth = require('basic-auth')
const bcryptjs = require('bcryptjs');
const { models } = require('./db');

//MODELS REFERENCE
const { User } = models;

/*******************************************
 * authenticateUser - CHECK FOR CREDENTIALS
 *******************************************/
const authenticateUser = async(req, res, next) => {
    try {
        let message = null;

        // PARSE CREDS FROM AUTH HEADER
        const credentials = auth(req);
            
        // IF CREDS ARE AVAILABLE
        if (credentials) {

            //USE EMAIL TO RETRIEVE USER FROM DATABASE
            const user =  await User.findOne({
                where: {emailAddress: credentials.name}
            });

        
            // IF RETRIEVED SUCCESSFULLY
            if (user) {
                //USE BCRYPTJS TO CHECK PASSWORD MATCH
                const authenticated = bcryptjs
                    .compareSync(credentials.pass, user.password);
                
                // IF PASSWORD MATCHES
                if (authenticated) {
                    console.log("authenticated");
                    req.currentUser = user;  
                } else {
                    message = `Invalid Credentials: ${User.emailAddress}`;
                }
            } else {
                message = `No user with matching email address: ${credentials.name}`;
            }
        } else {
            message = 'Authorization header not found';
        }
    
    
        // IF AUTH FAILED
        if (message) {
            console.warn(message);

            //401 STATUS IF FAILED
            res.status(401).json({ message: "Access Denied: Invalid Credentials" });
        } else {
            //IF SUCCEEDED
            next();
        }  
    } catch (error) {
        throw error;
    }
}



module.exports = { authenticateUser };