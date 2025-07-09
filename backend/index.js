const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('JWT_SECRET:', process.env.JWT_SECRET); // Env kontrol
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const app = express();
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(cors({
  origin: 'https://benim-web-sitem.netlify.app',  // frontend domain’i buraya
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// JWT doğrulama middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Token gerekli' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token geçersiz' });

    req.user = user; // userId ve role burada olacak
    next();
  });
}

app.get('/', (req, res) => {
  res.send('API çalışıyor 🚀');
});

// Korumalı Todo Listeleme
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const todos = await prisma.todo.findMany();
      return res.json(todos);
    }
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.userId },
    });
    res.json(todos);
  } catch (err) {
    console.error('GET /api/todos hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Korumalı Todo Oluşturma
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const newTodo = await prisma.todo.create({
      data: {
        text,
        done: false,
        userId: req.user.userId,
      },
    });

    res.status(201).json(newTodo);
  } catch (err) {
    console.error('POST /api/todos hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Korumalı Todo Güncelleme
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await prisma.todo.findUnique({ where: { id: Number(id) } });

    if (!todo) return res.status(404).json({ error: 'Todo bulunamadı' });

    if (req.user.role !== 'admin' && todo.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Yetkisiz işlem' });
    }

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

// Korumalı Todo Silme
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await prisma.todo.findUnique({ where: { id: Number(id) } });

    if (!todo) return res.status(404).json({ error: 'Todo bulunamadı' });

    if (req.user.role !== 'admin' && todo.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Yetkisiz işlem' });
    }

    await prisma.todo.delete({ where: { id: Number(id) } });
    res.sendStatus(204);
  } catch (err) {
    console.error('DELETE /api/todos/:id hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı Kayıt (role default: "user" olacak)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'user',  // default role
      },
    });

    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    console.error('POST /api/register hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı Giriş (token içine role da ekleniyor)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'E-posta bulunamadı' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Şifre yanlış' });
    }

    let token;
    try {
      token = jwt.sign(
        { userId: user.id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );
    } catch (e) {
      console.error('JWT sign hatası:', e);
      return res.status(500).json({ error: 'Token oluşturulamadı' });
    }

    res.json({ token });
  } catch (err) {
    console.error('POST /api/login hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
