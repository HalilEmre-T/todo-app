const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API çalışıyor 🚀');

}); 
app.get('/api/todos', async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const newTodo = await prisma.todo.create({
      data: { text, done: false },
    });

    res.status(201).json(newTodo);
  } catch (err) {
    console.error('POST /api/todos hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.todo.update({
      where: { id: Number(id) },
      data: { done: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/todos/:id hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.todo.delete({ where: { id: Number(id) } });
    res.sendStatus(204);
  } catch (err) {
    console.error('DELETE /api/todos/:id hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});