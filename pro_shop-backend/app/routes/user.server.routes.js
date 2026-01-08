const users = require('../controllers/user.server.controller');
const { isAuthenticated } = require('../lib/authentication');

module.exports = (app) => {
    app.post('/users', users.createUser);
    app.post('/login', users.loginUser);
    app.post('/logout', isAuthenticated, users.logoutUser);
    app.get('/users/:user_id', users.getUser);
}