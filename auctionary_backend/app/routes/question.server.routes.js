const questions = require('../controllers/question.server.controller');
const { isAuthenticated } = require('../lib/authentication');

module.exports = (app) => {
    app.get('/item/:item_id/question', questions.getQuestionsForItem);
    app.post('/item/:item_id/question',isAuthenticated, questions.askQuestion);
    app.post('/question/:question_id', isAuthenticated, questions.answerQuestion);
}