'use strict';

//IMPORTS
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

console.info('Instantiating and configuring the Sequelize object instance...');

//USE DATABASE
const options = {
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
};

//NEW SEQUELIZE OBJECT
const sequelize = new Sequelize(options);

//EMPTY MODELS OBJECT
const models = {};

//IMPORT MODELS
fs
  .readdirSync(path.join(__dirname, 'models'))
  .forEach((file) => {
    console.info(`Importing database model from file: ${file}`);
    const model = require(path.join(__dirname, 'models', file))(sequelize, Sequelize);
    models[model.name] = model;
  });

//CREATE NECESSARY ASSOCIATIONS
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    console.info(`Configuring the associations for the ${modelName} model...`);
    models[modelName].associate(models);
  }
});

//EXPORTS
module.exports = {
  sequelize,
  Sequelize,
  models,
};