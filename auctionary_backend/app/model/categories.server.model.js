const db = require('../../database');

const getCategories = (done) => {
    const sql = 'SELECT category_id, name FROM categories';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return done(err);
        }
        const categories = rows.map(row => ({
            category_id: row.category_id,
            name: row.name,
        }));
        return done(null, categories);
    });
};

module.exports = {
    getCategories
};
