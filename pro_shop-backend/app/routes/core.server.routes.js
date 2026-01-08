const core = require('../controllers/core.server.controller');
const { isAuthenticated } = require('../lib/authentication');
const { searchAuthentication } = require('../lib/authentication');


module.exports = (app) => {
    app.get('/search', searchAuthentication, core.searchItems);
    app.post('/item', isAuthenticated, core.createItem);
    app.get('/item/:item_id', core.getItem);
    app.post('/item/:item_id/bid', isAuthenticated, core.bidItem);
    app.get('/item/:item_id/bid', core.bidHistory);


}