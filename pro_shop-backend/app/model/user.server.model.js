const db = require("../../database.js");
const crypto = require("crypto");

const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, `sha256`).toString(`hex`);
};

const addNewUser = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);
    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)';
    let values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];

    db.run(sql, values, function(err) {
        if(err){
            if (err.code === 'SQLITE_CONSTRAINT') {
                return done(new Error('Email already exists'));
            }
            return done(err);
        }
        return done(null, this.lastID);
    });
};

const authenticateUser = (email, password, done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';

    db.get(sql, [email], (err, row) => {
        if(err){
            return done(err);
        }
        if(!row){
            return done(404);
        }
        if(row.salt == null) row.salt = '';

        let salt = Buffer.from(row.salt, 'hex');

        if (row.password === getHash(password, salt)){
            return done(null, row.user_id);
        } else {
            return done(404);
        }
    });
}

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');
    const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';

    db.run(sql, [token, id], (err) => {
        return done(err, token);
    });
}

const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';

    db.run(sql, [token], (err) => {
        return done(err);
    });
}

const getToken = (id, done) => {
    const sql = 'SELECT session_token FROM users WHERE user_id = ?';
    db.get(sql, [id], (err, row) => {
        if(err){
            return done(err);
        }
        if(!row){
            return done(404);
        }
        return done(null, row.session_token);
    });
}

const getIdByToken = (token, done) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?';
    db.get(sql, [token], (err, row) => {
        if(err){
            return done(err);
        }
        if(!row){
            return done(null, null);
        }
        return done(null, row.user_id);
    });
}

const getUserById = (user_id, done) => {
    const sql = 'SELECT user_id, first_name, last_name FROM users WHERE user_id = ?';

    db.get(sql, [user_id], (err, row) => {
        if (err) return done(err);
        if (!row) return done(404);
        const selling_sql = 'SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name FROM items i JOIN users u on i.creator_id = u.user_id WHERE i.creator_id = ? AND i.end_date > ?';
        db.all(selling_sql, [user_id, Date.now()], (err, selling) => {
            if (err) return done(err);
            
            const bidding_sql = 'SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name FROM bids b JOIN items i on b.item_id = i.item_id JOIN users u on i.creator_id = u.user_id WHERE b.user_id = ?';
            db.all(bidding_sql, [user_id], (err, bidding_on) => {
                if (err) return done(err);

                const ending_sql = 'SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name FROM items i JOIN users u on i.creator_id = u.user_id WHERE i.creator_id = ? AND i.end_date <= ?';
                db.all(ending_sql, [user_id, Date.now()], (err, auctions_ended) => {
                    if (err) return done(err);

                    const user = {
                        user_id: row.user_id,
                        first_name: row.first_name,
                        last_name: row.last_name,
                        selling,
                        bidding_on,
                        auctions_ended
                    };
                    return done(null, user);        
                });
            });
        });
    })
};





module.exports = {
    addNewUser: addNewUser,
    authenticateUser: authenticateUser,
    setToken: setToken,
    removeToken: removeToken,
    getToken: getToken,
    getIdByToken: getIdByToken,
    getUserById: getUserById
};
