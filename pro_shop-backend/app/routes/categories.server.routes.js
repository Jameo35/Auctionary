const categories = require('../controllers/categories.server.controller');

module.exports = (app) => {
    app.get('/categories', categories.getAllCategories);
};