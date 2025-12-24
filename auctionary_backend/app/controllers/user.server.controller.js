const { use } = require('chai');
const users = require('../model/user.server.model');
const joi = require('joi');


const createUser = (req, res) => {
  const schema = joi.object({
    first_name: joi.string().min(1).max(50).required().pattern(/^[A-Za-z]+$/, 'Letters only allowed in the First Name'),
    last_name: joi.string().min(1).max(50).required().pattern(/^[A-Za-z]+$/,'Letters only allowed in the Last Name'),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(36).required().pattern(/\d/, 'at least one number').pattern(/[A-Z]/, 'at least one uppercase letter').pattern(/[a-z]/, 'at least one lowercase letter').pattern(/[@$!%*?&]/, 'at least one special character'),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ error_message: error.details[0].message });

  const { first_name, last_name, email, password } = req.body;
  users.addNewUser({ first_name, last_name, email, password }, (err, user_id) => {
    if (err) {
        if (err.message === 'Email already exists') {
        return res.status(400).json({ error_message: err.message });
      }
        return res.status(500).json({ error_message: 'Internal server error' });
    }
    return res.status(201).json({ user_id });
  });
}

const loginUser = (req, res) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).max(36).required().pattern(/\d/, 'at least one number').pattern(/[A-Z]/, 'at least one uppercase letter').pattern(/[a-z]/, 'at least one lowercase letter').pattern(/[@$!%*?&]/, 'at least one special character'),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error_message: error.details[0].message });

  const { email, password } = req.body;

  users.authenticateUser(email, password, (err, user_id) => {
    if (err) {
      if (err === 404) {
        return res.status(400).json({ error_message: 'Invalid email or password' });
      }
      return res.status(500).json({ error_message: 'Internal server error' });
    }

    users.getToken(user_id, (err, token) => {
      if (err && err !== 404) {
        return res.status(500).json({ error_message: 'Internal server error' });
      }

      if (token) {
        return res.status(200).json({ user_id, session_token: token });
      }
      
      users.setToken(user_id, (err, token) => {
        if (err) {
          return res.status(500).json({ error_message: 'Internal server error' });
        }
        return res.status(200).json({ user_id, session_token: token });
      });
    });
  });
};


const logoutUser = (req, res) => {
  const token = req.headers['x-authorization'];

  users.removeToken(token, (err) => {
    if (err) {
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    return res.sendStatus(200);
  });
}

const getUser = (req, res) => {
    const user_id = parseInt(req.params.user_id, 10);
    users.getUserById(user_id, (err, user) => {
        if (err==404) {
            return res.status(404).json({ error_message: 'User not found' });
        }
        if (err) {
            return res.status(500).json({ error_message: 'Internal Server Error' });
        }
        return res.status(200).json(user);
    });
};

module.exports = {
    createUser: createUser,
    loginUser: loginUser,
    logoutUser: logoutUser,
    getUser: getUser
};