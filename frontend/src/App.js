import React, { useState, useEffect } from 'react';

const API_URL = 'https://todo-app-9gw9.onrender.com';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // Görevleri çek
  useEffect(() => {
    fetch(`${API_URL}/api/todos`)
      .then(res => res.json())
      .then(data => {
        console.log('Backendden gelen todos :', data);
        setTodos(data);
      })
      .catch(err =>{
        console.error('Görevler yüklenirken hata  :', err);
      });
  }, []);

  // Yeni görev ekle
  const addTodo = async () => {
    if (!input.trim()) return;

    const res = await fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });

    const yeni = await res.json();
    console.log('Yeni görev backend`den', yeni);
    setTodos([yeni, ...todos]);
    setInput('');
  };

  // Görevi tamamla (done: true)
const markDone = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('PUT hata:', errorText);
      alert('Görevi tamamlarken hata oluştu.');
      return;
    }

    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: true } : todo
    ));
  } catch (error) {
    console.error('PUT isteği sırasında hata:', error);
    alert('Sunucuya bağlanırken hata oluştu.');
  }
};

  // Görevi sil
const deleteTodo = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('DELETE hata:', errorText);
      alert('Görevi silerken hata oluştu.');
      return;
    }

    setTodos(todos.filter(todo => todo.id !== id));
  } catch (error) {
    console.error('DELETE isteği sırasında hata:', error);
    alert('Sunucuya bağlanırken hata oluştu.');
  }
};

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', fontFamily: 'Arial' }}>
      <h2>📝 Yapılacaklar Listesi</h2>

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
    </div>
  );
}

export default App;
