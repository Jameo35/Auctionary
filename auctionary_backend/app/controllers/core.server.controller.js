const items = require('../model/core.server.model');
const users = require('../model/user.server.model');
const joi = require('joi');

const createItem = (req, res) => {
  const schema = joi.object({
    name: joi.string().min(1).max(100).required(),
    description: joi.string().min(1).max(500).required(),
    starting_bid: joi.number().min(0).required(),
    end_date: joi.number().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.details[0].message });
    const { name, description, starting_bid, end_date } = req.body;

  if (!items.checkDateValidity(end_date)) {
    return res.status(400).json({ error_message: 'End date must be in the future' });
  }

  const token = req.headers['x-authorization'];

  users.getIdByToken(token, (err, user_id) => {
    if (err) {
      if (err === 404) {
        return res.status(401).json({ error_message: 'Unauthorised' });
      }
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    
    items.addNewItem({ name, description, starting_bid, end_date, user_id }, (err, item_id) => {
        if (err) {
            return res.status(500).json({ error_message: 'Internal server error' });
        }
        return res.status(201).json({ item_id });
    });
});
};

const getItem = (req, res) => {
  const item_id = parseInt(req.params.item_id, 10);
  items.getItem(item_id, (err, item) => {
    if (err) {
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    if (!item) {
      return res.status(404).json({ error_message: 'Item not found' });
    }
    return res.status(200).json(item);
  });
};

const bidItem = (req, res) => {
  const item_id = parseInt(req.params.item_id, 10);
  const user_id = req.user_id;
  const schema = joi.object({
    amount: joi.number().min(0).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error_message: error.details[0].message });
  const { amount } = req.body;

  items.makeBid({item_id, amount, user_id}, (err) => {
    if (err) {
      if (err.status === 400) {
        return res.status(400).json({ error_message: 'Bid amount must be higher than current bid' });
      }
      if (err.status === 404) {
        return res.status(404).json({ error_message: 'Item not found' });
      }
      if (err.status === 403) {
        return res.status(403).json({ error_message: 'Creator cannot bid on their own item' });
      }
      return res.status(500).json({ error_message: err.message});
    }
    return res.status(201).json({ message: 'Bid placed successfully' });
  });
};

const bidHistory = (req, res) => {
  const item_id = parseInt(req.params.item_id, 10);
  items.bidHistory(item_id, (err, bids) => {
    if (err) {
      if (err === 404) {
        return res.status(404).json({ error_message: 'Item not found' });
      }
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    return res.status(200).json(bids);
  });
};

const searchItems = (req, res) => {
  const {q, status, limit, offset} = req.query;
  const user_id = req.user_id || null;

  items.searchItems({q, status, limit, offset, user_id}, (err, itemList) => {
    if (err) {
      if (err === 400) {
        return res.status(400).json({ error_message: 'Bad Request' });
      }
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    return res.status(200).json(itemList);
  });
};


module.exports = {
    createItem: createItem,
    getItem: getItem,
    bidItem: bidItem,
    bidHistory: bidHistory,
    searchItems: searchItems
};