'use strict'

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "Please provide value for 'firstName'"
                }
            }
        }, 
        lastName: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "Please provide value for 'lastName'"
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "Please provide value for 'emailAddress'"
                },
                is: {
                    args: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    msg: "Please provide a VALID 'emailAddress'"
                }
            }
        },
        password: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "Please provide value for 'password'"
                }
            }
        }
    }, {sequelize});

    User.associate = (models) => {
        User.hasMany(models.Course, {
            as: 'user', // alias
            foreignKey: {
                fieldName: 'userId',
                allowNull: false
            }
        })
    }

    return User;
}
