'use strict'

//IMPORTS
const express = require('express');
const {check, validationResult} = require('express-validator');
const bcryptjs = require('bcryptjs');
const { models } = require('./db');

//IMPORT MIDDLEWARE
const isEmpty = require('./middleware/isEmpty');
const isUniqueEmail = require('./middleware/uniqueEmail');
const authenticate = require('./middleware/authenticate');

//SET UP ROUTER
const router = express.Router();

//MODEL REFERENCES
const { User, Course } = models;

/***************************
 * ASYNC HANDLER FUNCTION
 ***************************/
function asyncHandler(cb){
    return async (req, res, next)=>{
      try {
        await cb(req,res, next);
      } catch(err){
        next(err);
      };
    };
};

/****************
 * USER ROUTES
 ****************/

//GET /api/users
router.get('/api/users', authenticate.authenticateUser, asyncHandler(async(req, res) => {
    const user = req.user;

    res.json({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      password: user.password
    });
}));

//POST /api/users
router.post('/api/users', [
    check('firstName')
        .exists()
        .withMessage("Please provide value for 'firstName'"),
    check('lastName')
        .exists()
        .withMessage("Please provide value for 'lastName'"),
    check('emailAddress')
        .exists()
        .withMessage("Please provide value for 'emailAddress'"),
    check('password')
        .exists()
        .withMessage("Please provide value for 'password'")
    ],asyncHandler(async(req, res) => { 
        try {
            const errors = validationResult(req);
            const user = req.body;

            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg);
        
                return res.status(400).json({ errors: errorMessages });
            };

            //CHECK IF USER EMAIL ALREADY EXISTS
            const uniqueEmail = await isUniqueEmail.isUniqueEmail(user);

            if(!uniqueEmail) {
                return res.status(400).json({ error: "Email already in use. please provide a unique email." });
            };

            const newUser = await User.create(user);

            //HASHES PASSWORD
            user.password = bcryptjs.hashSync(user.password);
            
            //201 STATUS AND END
            res.status(201).location(`/`).end();

        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                res.status(400).location('/').json({error: error.errors[0].message})
            } else {
                throw error
            };
        };
        
}));

/*****************
 * COURSE ROUTES
 *****************/

 //GET /api/courses
 router.get("/api/courses", asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "emailAddress"]
        },
        attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded"]
    });

    res.json(courses);

}));

 //GET /api/courses/:id
 router.get("/api/courses/:id", asyncHandler(async(req, res) => {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId, {
        include: {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "emailAddress"]
        },
        attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded"]
    });

    if (course) {
        res.json(course)
    } else {
        res.status(404).json({message: "couldn't find course by id provided"})
    };
}));

 //POST /api/courses
 router.post("/api/courses", [
    check("title")
        .exists()
        .withMessage("Please provide value for 'title'"),
    check("description")
        .exists()
        .withMessage("Please provide value for 'description'"),
    check("userId")
        .exists()
        .withMessage("Please provide value for 'userId'")
], authenticate.authenticateUser, asyncHandler(async(req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.message);

        return res.status(400).json({ errors: errorMessages });
    };

    const course = req.body;

    //ADD COURSE TO DATABASE
    const newCourse = await Course.create(course);
    const courseId = newCourse.dataValues.id;

    //201 STATUS AND END
    res.status(201).location(`/courses/${courseId}`).end();

}));

 //PUT /api/courses/:id
 router.put("/API/courses/:id", authenticate.authenticateUser, asyncHandler(async(req, res) => {

    //VALIDATE JSON NOT EMPTY
    if(isEmpty.isEmpty(req.body)) {
        return res.status(400).json({message: "JSON data cannot be empty"});
    };

    const userId = req.currentUser.dataValues.id;
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);
    
    //IF COURSE IS FOUND
    if (course) {
        const courseUserId = course.dataValues.userId;

        //ONLY USER WITH COURSE CAN EDIT COURSE
        if(userId === courseUserId) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.status(403).json({message: "You do not have the authorization to make changes to this course."});
        }
        
    } else {
        res.status(401).json({message: "No Course Found"});
    };
}));

 //DELETE /api/courses/:id 
 router.delete("/courses/:id", authenticate.authenticateUser, asyncHandler(async(req, res) => {
    const userId = req.currentUser.dataValues.id;
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);
    
    //IF COURSE IS FOUND
    if (course) {
        const courseUserId = course.dataValues.userId
        //ONLY USER WITH COURSE CAN DELETE
        if (userId === courseUserId) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(403).json({message: "You do not have the authorization to remove this course."})
        };
    } else {
        res.status(401).json({message: "No Course Found"})
    }
}));

module.exports = router;