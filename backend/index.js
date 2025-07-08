const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('API çalışıyor 🚀');
}); 

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/api/todos', async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  const newTodo = await prisma.todo.create({ data: { text, done: false } });
  res.json(newTodo);
});

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.todo.update({
    where: { id: Number(id) },
    data: { done: true },
  });
  res.json(updated);
});

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.todo.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});