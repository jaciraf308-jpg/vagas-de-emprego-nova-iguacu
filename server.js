const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'jobs.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir banco de dados:', err.message);
    process.exit(1);
  }
});

function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      imageUrl TEXT,
      createdAt TEXT NOT NULL
    )
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela jobs:', err.message);
    }
  });
}

createTable();

app.get('/api/jobs', (req, res) => {
  const query = 'SELECT * FROM jobs ORDER BY id DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar vagas:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar vagas' });
    }
    res.json(rows);
  });
});

app.post('/api/jobs', (req, res) => {
  const { title, company, location, type, description, imageUrl } = req.body;
  if (!title || !company || !location || !type || !description) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO jobs (title, company, location, type, description, imageUrl, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [title, company, location, type, description, imageUrl || null, createdAt], function (err) {
    if (err) {
      console.error('Erro ao inserir vaga:', err.message);
      return res.status(500).json({ error: 'Erro ao salvar vaga' });
    }

    const newJob = {
      id: this.lastID,
      title,
      company,
      location,
      type,
      description,
      imageUrl: imageUrl || null,
      createdAt,
    };

    res.status(201).json(newJob);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
