const categories = require('../model/categories.server.model');
const getAllCategories = (req, res) => {
    categories.getCategories((err, categories) => {
        if (err) {
            return res.status(500).json({ error_message: 'Internal server error' });
        }
        return res.status(200).json(categories);
    });
};

module.exports = {
    getAllCategories
};
