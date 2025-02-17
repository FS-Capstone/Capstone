const Sequelize = require('sequelize')
const db = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const axios = require('axios');

const SALT_ROUNDS = 5;

const User = db.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true //Password can be null for oauth. We are checking for password in the signup server route.
  },
  email: {
    type: Sequelize.STRING,
    isEmail: true,
    unique: true,
    allowNull: false,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
 
  currentlySelectedPantryId: {
    type: Sequelize.INTEGER
  },
  shoppingList: {
    type: Sequelize.JSONB,
    defaultValue: []
  }
})

module.exports = User

/**
 * instanceMethods
 */
User.prototype.correctPassword = function(candidatePwd) {
  //we need to compare the plain version to an encrypted version of the password
  return bcrypt.compare(candidatePwd, this.password);
}

User.prototype.generateToken = function() {
  return jwt.sign({id: this.id}, process.env.JWT)
}

User.prototype.getPantries = async function(){
  return(
    (await db.models.pantry.findAll({
      where: {
        userId: this.id
      },
      include:[db.models.ingredient]
    })).map(pantry => pantry.dataValues)
  )
}

User.prototype.removePantryById = async function(pantryId){
  let pantries = await db.models.pantry.findAll({where:{userId: this.id}})
  if(pantries.length === 1){
    const error = Error('Cannot delete the last pantry');
    error.status = 409;
    throw error;
  }

  await pantries.find(pantry => pantry.id === pantryId * 1).destroy();
  pantries = await db.models.pantry.findAll({where:{userId: this.id}})
  //handle case where we are deleting the current pantry
  if(pantryId * 1 === this.currentlySelectedPantryId){
    this.currentlySelectedPantryId = pantries[0].id;
    await this.save();
  }
}
/**
 * classMethods
 */
User.authenticate = async function({ username, password }){
    const user = await this.findOne({where: { username }})
    if (!user || !(await user.correctPassword(password))) {
      const error = Error('Incorrect username/password');
      error.status = 401;
      throw error;
    }
    return user.generateToken();
};

User.findByToken = async function(token) {
  try {
    const {id} = await jwt.verify(token, process.env.JWT)
    const user = User.findOne({where: {id: id}, include: db.models.recipe});
    if (!user) {
      throw 'nooo'
    }
    return user
  } catch (ex) {
    const error = Error('bad token')
    error.status = 401
    throw error
  }
}

User.prototype.changePassword = async function(newPassword){
  this.password = newPassword;
  await hashPassword(this);
  await this.save();
}

/**
 * hooks
 */
const hashPassword = async(user) => {
  //in case the password has been changed, we want to encrypt it with bcrypt
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
}

//every user should have a pantry created to start out with
User.afterCreate(async (user, options) => {
  const pantry = await db.models.pantry.create({name:'Main', userId: user.id});
  user.currentlySelectedPantryId = pantry.id;
  await user.save();
})

User.beforeCreate(hashPassword)
// Might have to add this back in if we allow user to change password
// User.beforeUpdate(hashPassword)
User.beforeBulkCreate(users => Promise.all(users.map(hashPassword)))
