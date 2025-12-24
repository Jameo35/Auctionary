const joi = require('joi');
const questions = require('../model/question.server.model');

const getQuestionsForItem = (req, res) => {
    const item_id = parseInt(req.params.item_id, 10);
    
    questions.getQuestionsForItem(item_id, (err, questionList) => {
    if (err) {
      if (err === 404) {
        return res.status(404).json({ error_message: 'Item Not Found' });
      }
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    return res.status(200).json(questionList);
    });
};

const askQuestion = (req, res) => {
    const schema = joi.object({
        question_text: joi.string().min(1).max(500).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const user_id = req.user_id;
    const item_id = parseInt(req.params.item_id, 10);
    const question_text = req.body.question_text;

    questions.askQuestion(item_id, user_id, question_text, (err, question_id) => {
        if (err) {
            if (err === 404) {
                return res.status(404).json({ error_message: 'Item Not Found' });
            }
            if (err === 403) {
                return res.status(403).json({error_message: 'You cannot ask a question on your own item'})
            }
            return res.status(500).json({ error_message: 'Internal server error' });
        }
        return res.status(200).json({ question_id: question_id });
    });
};

const answerQuestion = (req, res) => {
    const schema = joi.object({
        answer_text: joi.string().min(1).max(500).required(),
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const user_id = req.user_id;
    const question_id = parseInt(req.params.question_id, 10);
    const answer_text = req.body.answer_text;

    questions.answerQuestion(question_id, user_id, answer_text, (err) => {
        if (err) {
            if (err === 404) {
                return res.status(404).json({ error_message: 'Question Not Found' });
            }
            if (err === 403) {
                return res.status(403).json({error_message: 'Only the seller can answer questions on their items'})
            }
            return res.status(500).json({ error_message: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Answer submitted successfully' });
    });
};

module.exports = {
    getQuestionsForItem: getQuestionsForItem,
    askQuestion:askQuestion,
    answerQuestion:answerQuestion
};