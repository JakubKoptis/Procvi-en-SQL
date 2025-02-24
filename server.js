const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    text TEXT NOT NULL
)`);

app.post('/notes', (req, res) => {
    const { category, text } = req.body;
    if (!category || !text) {
        return res.status(400).json({ error: 'Kategorie a text jsou povinné' });
    }
    db.run('INSERT INTO notes (category, text) VALUES (?, ?)', [category, text], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, category, text });
    });
});

app.get('/notes', (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT * FROM notes WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND text LIKE ?';
        params.push(`%${search}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM notes WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Záznam nenalezen' });
        }
        res.json({ message: 'Záznam úspěšně smazán' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});
