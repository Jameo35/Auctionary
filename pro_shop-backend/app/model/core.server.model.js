const { use } = require("chai");
const db = require("../../database.js");


const addNewItem = (item, done) => {
    const sql = 'INSERT INTO items (name, description, starting_bid,start_date,end_date,creator_id) VALUES (?,?,?,?,?,?)';
    let values = [item.name, item.description, item.starting_bid, Date.now(), item.end_date,item.user_id];

    db.run(sql, values, function(err) {
        if(err){
            return done(err);
        }
        return done(null, this.lastID);
    });
};

const checkDateValidity = (end_date) => {
    const currentDate = Date.now();
    return end_date > currentDate;
};

const getItem = (item_id, done) => {
  const sql = `
    SELECT 
  i.item_id,
  i.name,
  i.description,
  i.starting_bid,
  i.start_date,
  i.end_date,
  i.creator_id,
  u.first_name AS creator_first_name,
  u.last_name AS creator_last_name,
  b.amount AS current_bid,
  b.user_id AS current_bid_holder_id,
  bh.first_name AS current_bid_holder_first_name,
  bh.last_name AS current_bid_holder_last_name,
  c.category_id,
  c.name AS category_name
FROM items i
JOIN users u ON i.creator_id = u.user_id
LEFT JOIN (
  SELECT b1.*
  FROM bids b1
  JOIN (
    SELECT item_id, MAX(amount) AS max_amount
    FROM bids
    GROUP BY item_id
  ) b2 ON b1.item_id = b2.item_id AND b1.amount = b2.max_amount
) b ON b.item_id = i.item_id
LEFT JOIN users bh ON b.user_id = bh.user_id
LEFT JOIN item_categories ic ON i.item_id = ic.item_id
LEFT JOIN categories c ON ic.category_id = c.category_id
WHERE i.item_id = ?;
  `;
    const values = [item_id];
    
    db.all(sql, values, (err, rows) => {
        if (err) {
            
            return done(err);
        }
        if (rows.length === 0) {
            return done(null, null);
        }
        const item = {
            item_id: rows[0].item_id,
            name: rows[0].name,
            description: rows[0].description,
            starting_bid: rows[0].starting_bid,
            start_date: rows[0].start_date,
            end_date: rows[0].end_date,
            creator_id: rows[0].creator_id,
            first_name: rows[0].creator_first_name,
            last_name: rows[0].creator_last_name,
            current_bid: rows[0].current_bid !== null ? rows[0].current_bid : rows[0].starting_bid,
            current_bid_holder: rows[0].current_bid !== null ?
            {
              user_id: rows[0].current_bid_holder_id,
              first_name: rows[0].current_bid_holder_first_name,
              last_name: rows[0].current_bid_holder_last_name,
            }  : null,
            categories: rows[0].category_id !== null ? [] : null
        };

        rows.forEach(row => {
            if (row.category_id !== null) {
                item.categories.push({
                    category_id: row.category_id,
                    name: row.category_name
                });
            }
        });
        return done(null, item);
    });
};

const makeBid = (bid, done) => {
    const itemCreatorSql = 'SELECT creator_id, starting_bid FROM items WHERE item_id = ?';
    const currentBidSql = 'SELECT MAX(amount) AS max_amount FROM bids WHERE item_id = ?';

    db.get(itemCreatorSql, [bid.item_id], (err, itemRow) => {
        if (err) return done(err);

        if (!itemRow) {
            const error = new Error('Item not found');
            error.status = 404;
            return done(error);
        }

        if (itemRow.creator_id === bid.user_id) {
            const error = new Error('Creator cannot bid on their own item');
            error.status = 403;
            return done(error);
        }

        db.get(currentBidSql, [bid.item_id], (err, bidRow) => {
            if (err) return done(err);

            const current_max = bidRow?.max_amount;

            if (current_max === null) {
                if (Number(bid.amount) <= Number(itemRow.starting_bid)) {
                    const error = new Error('Bid too low');
                    error.status = 400;
                    return done(error);
                }
                return insertBid(bid, done);
            }

            if (Number(bid.amount) <= Number(current_max)) {
                const error = new Error('Bid too low');
                error.status = 400;
                return done(error);
            }

            return insertBid(bid, done);
        });
    });
};


const insertBid = (bid, done) => {
    const sql = 'INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?,?,?,?)';
    const values = [bid.item_id, bid.user_id, bid.amount, Date.now()];

    db.run(sql, values, function(err) {
        if (err) {
            return done(err);
        }
        return done(null);
    });
};

const bidHistory = (item_id, done) => {

    checkItemExists(item_id, (err) => {
        if (err) {
            return done(err);
        }
    const bidsSQL = 'SELECT b.item_id, b.amount, b.timestamp, u.user_id, u.first_name, u.last_name from bids b JOIN users u ON b.user_id = u.user_id WHERE item_id = ? ORDER BY amount DESC';
    const values = [item_id];
    
    db.all(bidsSQL, values, (err, rows) => {
        if (err) {
            return done(err);
        }
        const bids = rows.map(row => ({
            item_id: row.item_id,
            amount: row.amount,
            timestamp: row.timestamp,
            user_id: row.user_id,
            first_name: row.first_name,
            last_name: row.last_name,
        }));
        return done(null, bids);
    })
    });
};

const checkItemExists = (item_id, done) => {
    const sql = 'SELECT item_id FROM items WHERE item_id = ?';
    const values = [item_id];

    db.get(sql, values, (err, row) => {
        if (err) {
            return done(err);
        }
        if (!row) {
            return done(404);
        }
        return done(null);
    });
};

const searchItems = (query, done) => {
    const {q, status, limit = 20, offset = 0, user_id, category} = query;

    if (status && user_id === null) {
        return done(400);
    }

    let sql = ` WITH filtered AS ( SELECT DISTINCT i.item_id FROM items i LEFT JOIN item_categories ic ON i.item_id = ic.item_id LEFT JOIN categories c ON ic.category_id = c.category_id LEFT JOIN ( SELECT b1.* FROM bids b1 JOIN ( SELECT item_id, MAX(amount) AS max_amount FROM bids GROUP BY item_id ) b2 ON b1.item_id = b2.item_id AND b1.amount = b2.max_amount ) b ON b.item_id = i.item_id LEFT JOIN bids ub ON ub.item_id = i.item_id WHERE 1=1 `;

    const params = [];
    if (q) {
        sql += ' AND (i.name LIKE ?)';
        params.push(`%${q}%`);
    }

    const currentTime = Date.now();
    if (status === 'OPEN') {
        sql += ' AND i.end_date > ? AND i.creator_id = ?';
        params.push(currentTime);
        params.push(user_id);
    } else if (status === 'ARCHIVE') {
        sql += ' AND i.end_date <= ? AND i.creator_id = ?';
        params.push(currentTime);
        params.push(user_id);
    } else if (status === 'BID') {
        sql += ' AND ub.user_id = ?';
        params.push(user_id);
    }

    if (category) {
        sql += ' AND c.category_id = ?';
        params.push(category);
    }

    sql += ` ORDER BY i.start_date DESC LIMIT ? OFFSET ? ) SELECT i.item_id, i.name, i.description, i.starting_bid, i.start_date, i.end_date, i.creator_id, u.first_name AS creator_first_name, u.last_name AS creator_last_name, b.amount AS current_bid, c.category_id, c.name AS category_name FROM filtered f JOIN items i ON i.item_id = f.item_id JOIN users u ON i.creator_id = u.user_id LEFT JOIN ( SELECT b1.* FROM bids b1 JOIN ( SELECT item_id, MAX(amount) AS max_amount FROM bids GROUP BY item_id ) b2 ON b1.item_id = b2.item_id AND b1.amount = b2.max_amount ) b ON b.item_id = i.item_id LEFT JOIN item_categories ic ON i.item_id = ic.item_id LEFT JOIN categories c ON ic.category_id = c.category_id ORDER BY i.start_date DESC `;
    params.push(parseInt(limit, 10));
    params.push(parseInt(offset, 0));

        db.all(sql, params, (err, rows) => {
        if (err) {
            console.log(err);
            return done(err);
        }

        const items = [];
        let currentItem = null;


        rows.forEach(row => {
            if (!currentItem || currentItem.item_id !== row.item_id) {
                if (currentItem) {
                    items.push(currentItem);
                }

                currentItem = {
                    item_id: row.item_id,
                    name: row.name,
                    description: row.description,
                    starting_bid: row.starting_bid,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    creator_id: row.creator_id,
                    first_name: row.creator_first_name,
                    last_name: row.creator_last_name,
                    current_bid: row.current_bid !== null ? row.current_bid : row.starting_bid,
                    categories: []
                };
            }
            if (row.category_id !== null) {
                currentItem.categories.push({
                    category_id: row.category_id,
                    name: row.category_name
                });
            }

        });
        if (currentItem) {
            items.push(currentItem);
        }

        return done(null, items);
    });
};

const addItemCategories = (item_id, categories, done) => {
    if (categories.length === 0 || !categories) {
        return done(null);
    }
    const sql = 'INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)';
    const stmt = db.prepare(sql);
    categories.forEach((category_id) => {
        stmt.run(item_id, category_id, (err) => {
            if (err) {
                return done(err);
            }
        });
    });
    stmt.finalize((err) => {
        if (err) {
            return done(err);
        }
        return done(null);
    });
};


    



module.exports = {
    addNewItem: addNewItem,
    checkDateValidity:checkDateValidity,
    getItem:getItem,
    makeBid:makeBid,
    bidHistory:bidHistory,
    checkItemExists:checkItemExists,
    searchItems:searchItems,
    addItemCategories:addItemCategories
};
