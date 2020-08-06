//IMPORTS
const db = require('./db');

//MODELS REFERENCE
const { User } = db.models;

/*************************************
 * isUniqueEmail - NOT ALREADY A USER
 *************************************/
const isUniqueEmail = async(user) => {
    const users = await User.findAll({attributes: ["emailAddress"], raw: true});
    const userEmails = users.map(user => user.emailAddress)
    const uniqueEmail = userEmails.find(email => email === user.emailAddress)
    if (uniqueEmail) {
        return false
    } else {
        return true
    }
}

module.exports = { isUniqueEmail };