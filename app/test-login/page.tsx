'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@sportsclub.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState('');

  const handleTestLogin = async () => {
    try {
      const response = await fetch('/api/avtorizaciya/vhod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        // Проверяем cookie
        const cookies = document.cookie;
        setResult(prev => prev + '\n\nCookies: ' + cookies);
      }
    } catch (error) {
      setResult('Ошибка: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Тест входа</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleTestLogin}
            className="w-full btn btn-primary"
          >
            Тест входа
          </button>
        </div>
        
        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Результат:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
        
        <div className="mt-6">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Перейти на dashboard
          </a>
        </div>
      </div>
    </div>
  );
}


