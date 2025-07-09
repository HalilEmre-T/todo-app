import React, { useState, useEffect } from 'react';

const API_URL = 'https://todo-app-9gw9.onrender.com';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loadingTodos, setLoadingTodos] = useState(false);

  // Token değişirse localStorage'a yaz ve todo'ları getir
  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false);
      setTodos([]);
      localStorage.removeItem('token');
      return;
    }

    setIsLoggedIn(true);
    localStorage.setItem('token', token);

    async function fetchTodos() {
      setLoadingTodos(true);
      try {
        const res = await fetch(`${API_URL}/api/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Todo listesi alınamadı');
        const data = await res.json();
        setTodos(Array.isArray(data) ? data : []);
      } catch (err) {
        alert(err.message);
      }
      setLoadingTodos(false);
    }

    fetchTodos();
  }, [token]);

  // Kayıt veya Giriş işlemi
  const handleAuth = async () => {
    if (!email || !password) {
      alert('E-posta ve şifre gerekli');
      return;
    }
    try {
      const url = isRegisterMode ? `${API_URL}/api/register` : `${API_URL}/api/login`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Bir hata oluştu');
        return;
      }

      if (!isRegisterMode) {
        setToken(data.token);
        setEmail('');
        setPassword('');
      } else {
        alert('Kayıt başarılı, lütfen giriş yapınız.');
        setIsRegisterMode(false);
      }
    } catch (err) {
      alert('İstek başarısız');
    }
  };

  // Logout
  const logout = () => {
    setToken('');
  };

  // Yeni görev ekle
  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      });
      const yeni = await res.json();
      if (!res.ok) {
        alert(yeni.error || 'Görev eklenemedi');
        return;
      }
      setTodos([yeni, ...todos]);
      setInput('');
    } catch {
      alert('Sunucuya bağlanırken hata oluştu');
    }
  };

  // Görevi tamamla
  const markDone = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Görev güncellenemedi');
      setTodos(todos.map(todo => (todo.id === id ? { ...todo, done: true } : todo)));
    } catch {
      alert('Görev tamamlanamadı');
    }
  };

  // Görevi sil
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Görev silinemedi');
      setTodos(todos.filter(todo => todo.id !== id));
    } catch {
      alert('Görev silinemedi');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: '30px auto', fontFamily: 'Arial' }}>
        <h2>{isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <button onClick={handleAuth} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
          {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
        <button onClick={() => setIsRegisterMode(!isRegisterMode)} style={{ width: '100%', padding: 10 }}>
          {isRegisterMode ? 'Zaten üye misiniz? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
        </button>
      </div>
    );
  }

  // Giriş yapılmışsa todo listesi göster
  return (
    <div style={{ maxWidth: 600, margin: '30px auto', fontFamily: 'Arial' }}>
      <h2>📝 Yapılacaklar Listesi</h2>
      <button onClick={logout} style={{ marginBottom: 20, padding: 10 }}>
        Çıkış Yap
      </button>
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Yapılacak yaz..."
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={addTodo} style={{ marginLeft: 10, padding: '10px 20px' }}>
          Ekle
        </button>
      </div>
      {loadingTodos ? (
        <p>Yükleniyor...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map(todo => (
            <li
              key={todo.id}
              style={{
                padding: 12,
                marginBottom: 10,
                backgroundColor: '#f8f8f8',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textDecoration: todo.done ? 'line-through' : 'none',
                color: todo.done ? '#999' : '#000',
              }}
            >
              <span>{todo.text}</span>
              <div>
                {!todo.done && (
                  <button onClick={() => markDone(todo.id)} style={{ marginRight: 8 }}>
                    Tamamla
                  </button>
                )}
                <button onClick={() => deleteTodo(todo.id)}>Sil</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
