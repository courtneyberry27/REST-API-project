//IMPORTS
const auth = require('basic-auth')
const bcryptjs = require('bcryptjs');
//const { models } = require('./db');

/****************************
 * isEmpty - CHECK IF EMPTY 
 ****************************/
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

module.exports = { isEmpty };