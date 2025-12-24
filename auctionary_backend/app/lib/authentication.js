const { func } = require("joi");
const users = require("../model/user.server.model");


const isAuthenticated = function(req, res, next) {
    let token = req.headers['x-authorization'];
      if (!token) {
    return res.status(401).json({ error_message: 'Unauthorised: Token missing' });
  }

    users.getIdByToken(token, (err, user_id) => {
        if (err || user_id === null) {
            return res.status(401).json({ error_message: 'Unauthorised: Invalid Token' });
        }
        req.user_id = user_id;
        next();
    });
};

const searchAuthentication = function(req, res, next) {
    let token = req.headers['x-authorization'];
      if (!token) {
    return req.user_id = null, next();
  }

    users.getIdByToken(token, (err, user_id) => {
        if (err || user_id === null) {
            return req.user_id = null, next();
        }
        return req.user_id = user_id, next();
    });
};

module.exports = {
    isAuthenticated: isAuthenticated,
    searchAuthentication: searchAuthentication
};