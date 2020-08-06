const auth = require('basic-auth')
const bcryptjs = require('bcryptjs');
const { models } = require('./db');

//MODELS
const { User } = models;

/*************************
 * isUniqueEmail FUNCTION
 *************************/
const isUniqueEmail = async(user) => {
    const users = await User.findAll({attributes: ["emailAddress"], raw: true});
    const userEmails = users.map(user => user.emailAddress);
    const uniqueEmail = userEmails.find(email => email === user.emailAddress);
    if (uniqueEmail) {
        return false;
    } else {
        return true;
    };
};

/****************************
 * authenticateUser FUNCTION
 ****************************/
const authenticateUser = async(req, res, next) => {
    try {
        let message = null;

        // PARSE CREDENTIALS
        const credentials = auth(req);
            
        // IF EMAIL AVAILABLE
        if (credentials) {
            const user =  await User.findOne({
                where: {emailAddress: credentials.name}
            });

        
            // IF USER RETRIEVED SUCCESSFULLY
            if (user) {
                const authenticated = bcryptjs
                    .compareSync(credentials.pass, user.password);
                
                // IF PASSWORD MATCHES
                if (authenticated) {
                    console.log("authenticated");
                    req.currentUser = user;  
                } else {
                    message = `Authentication failure for user: ${User.emailAddress}` ;
                };
            } else {
                message = `User not found by email: ${credentials.name}`;
            };
        } else {
            message = 'Auth header not found';
        };
    
    
        // IF AUTHENTICATION FAILS OR SUCCEEDS
        if (message) {
            console.warn(message);
            
            res.status(401).json({ message: "Access Denied" });
        } else {
            
            next();
        };
    } catch (error) {
        throw error;
    };
};

/*************************
 * isEmpty FUNCTION
 *************************/
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    };

    return true;
};



module.exports = { authenticateUser, isUniqueEmail, isEmpty };