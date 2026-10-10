const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET all expenses (with optional filters)
  router.get('/', (req, res) => {
    try {
      const { category, from, to } = req.query;
      let sql = 'SELECT * FROM expenses WHERE 1=1';
      const params = [];
      if (category) { sql += ' AND category = ?'; params.push(category); }
      if (from) { sql += ' AND date >= ?'; params.push(from); }
      if (to) { sql += ' AND date <= ?'; params.push(to); }
      sql += ' ORDER BY date DESC, id DESC';
      res.json(db.prepare(sql).all(...params));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST add expense
  router.post('/', (req, res) => {
    try {
      const { title, category, amount, date } = req.body;
      if (!title || !category || !date || !(Number(amount) > 0)) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      const info = db
        .prepare('INSERT INTO expenses (title, category, amount, date) VALUES (?, ?, ?, ?)')
        .run(title.trim(), category, Number(amount), date);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE expense
  router.delete('/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};