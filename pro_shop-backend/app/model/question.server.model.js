const db = require("../../database.js");
const core = require('./core.server.model.js');

const getQuestionsForItem = (item_id, done) => {
    core.checkItemExists(item_id, (err) => {
        if (err) {
            return done(err);
        }
        const sql = 'SELECT question_id, question, answer FROM questions WHERE item_id = ? ORDER by question_id DESC';
        db.all(sql, [item_id], (err, rows) => {
            if (err) {
                return done(err);
            }
            const questions = rows.map(row => ({
                question_id: row.question_id,
                question_text: row.question,
                answer_text: row.answer || null
            }));
            return done(null, questions);
        });
    });
};

const askQuestion = (item_id, user_id, question_text, done) => {
    core.checkItemExists(item_id, (err) => {
        if (err) {
            return done(err);
        }
        checkOwnership(item_id, user_id, (err) => {
            if (err) {
                return done(err);
            }

            const sql = 'INSERT INTO questions (item_id, asked_by, question) VALUES (?, ?, ?)';
            const values = [item_id, user_id, question_text];
            db.run(sql, values, function(err) {
                if (err) {
                    return done(err);
                }
                return done(null, this.lastID);
            });
        });
    });
};

const answerQuestion = (question_id, user_id, answer_text, done) => {
    checkQuestionItemOwnership(question_id, user_id, (err) => {
        if (err) {
            return done(err);
        }
        const sql = 'UPDATE questions SET answer = ? WHERE question_id = ?';
        const values = [answer_text, question_id];
        db.run(sql, values, function(err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
    });
};


const checkOwnership = (item_id, user_id, done) => {
    const sql = 'SELECT creator_id FROM items WHERE item_id = ?';
    db.get(sql, [item_id], (err, row) => {
        if (err) {
            return done(err);
        }
        if (!row) {
            return done(404);
        }
        if (row.creator_id == user_id) {
            return done(403);
        }
        return done(null);
    });
};

const checkQuestionItemOwnership = (question_id, user_id, done) => {
    const sql = `SELECT i.creator_id FROM items i JOIN questions q ON i.item_id = q.item_id WHERE q.question_id = ?`;
    db.get(sql, [question_id], (err, row) => {
        if (err) {
            return done(err);
        }
        if (!row) {
            return done(404);
        }
        if (row.creator_id != user_id) {
            return done(403);
        }
        return done(null);
    });
};

module.exports = {
    getQuestionsForItem:getQuestionsForItem,
    askQuestion:askQuestion,
    answerQuestion:answerQuestion
};
