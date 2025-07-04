const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Tüm görevleri getir
app.get('/api/todos', async (req, res) => {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(todos);
});

// Yeni görev ekle
app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  const newTodo = await prisma.todo.create({ data: { text } });
  res.json(newTodo);
});

// Görevi tamamla (done: true)
app.put('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { done: true },
  });
  res.json(updatedTodo);
});

// Görevi sil
app.delete('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.todo.delete({ where: { id } });
  res.json({ message: 'Deleted' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
