const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

const db = new Database(path.join(__dirname, 'expenses.db'));
db.exec(fs.readFileSync(path.join(__dirname, 'expenses.sql'), 'utf8'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, 'script.js')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));

app.get('/api/expenses', (req, res) => {
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

app.post('/api/expenses', (req, res) => {
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

app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));