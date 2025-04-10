const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для парсинга JSON
app.use(express.json());

// Путь к папке с приложением
const publicPath = path.join(__dirname, 'public');

// Проверяем существование папки public, если нет - создаем
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath);
  console.log('Папка public создана');
}

// Маршрут для главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// API для заметок (опционально, можно использовать только localStorage)
app.get('/api/notes', (req, res) => {
  if (req.headers.accept.includes('application/json')) {
    try {
      const notes = JSON.parse(fs.readFileSync(path.join(publicPath, 'notes.json'), 'utf8'));
      res.json(notes);
    } catch (err) {
      res.json([]);
    }
  } else {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = Date.now();
  newNote.date = new Date().toLocaleString();

  let notes = [];
  try {
    notes = JSON.parse(fs.readFileSync(path.join(publicPath, 'notes.json'), 'utf8'));
  } catch (err) {
    // Файл не существует, создадим пустой массив
  }

  notes.push(newNote);
  fs.writeFileSync(path.join(publicPath, 'notes.json'), JSON.stringify(notes));
  res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let notes = [];
  try {
    notes = JSON.parse(fs.readFileSync(path.join(publicPath, 'notes.json'), 'utf8'));
  } catch (err) {
    res.status(404).json({ error: 'Файл заметок не найден' });
    return;
  }

  const filteredNotes = notes.filter(note => note.id !== id);
  fs.writeFileSync(path.join(publicPath, 'notes.json'), JSON.stringify(filteredNotes));
  res.json({ success: true });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Приложение доступно по адресу http://localhost:${port}/`);
});