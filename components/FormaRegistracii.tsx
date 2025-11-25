'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FormaRegistracii() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/avtorizaciya/registraciya', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/vhod');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 hover:shadow-indigo-500/20 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg mb-4 transform group-hover:rotate-6 transition-transform duration-500 mx-auto">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 animate-fade-in">
            Регистрация
          </h2>
              <p className="text-base text-gray-600 mt-2">
            Создайте новый аккаунт
          </p>
        </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                    className="w-full px-4 py-3 border-2 border-indigo-200/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-600 text-gray-900"
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                    className="w-full px-4 py-3 border-2 border-indigo-200/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                    className="w-full px-4 py-3 border-2 border-indigo-200/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                    className="w-full px-4 py-3 border-2 border-indigo-200/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                  {error}
                </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Регистрация...</span>
                      </>
                    ) : (
                      <>
                        <span>Зарегистрироваться</span>
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>

          <div className="text-center">
                <Link
                  href="/vhod"
                  className="group inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-300"
            >
                  <span>Уже есть аккаунт? Войти</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


