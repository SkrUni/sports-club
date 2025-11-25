import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="text-center overflow-visible">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-8 animate-fade-in leading-tight sm:leading-tight py-1 sm:py-2 block break-words w-full text-center">
            Спортивный клуб
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto font-medium leading-relaxed px-4">
            Современная система управления услугами спортивного клуба. Учет клиентов, услуг, записей и платежей в одном месте.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-center px-4 sm:px-0">
            <Link
              href="/vhod"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 overflow-hidden w-full sm:w-auto"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10 flex items-center gap-2">
                <span>Войти в систему</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
            <Link
              href="/registraciya"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-gray-800 bg-white/90 backdrop-blur-md border-2 border-indigo-300/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 hover:border-indigo-500 hover:bg-white w-full sm:w-auto"
            >
              <span className="relative z-10 text-center">Зарегистрироваться как клиент</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </div>
          </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto text-left hover:shadow-indigo-500/20 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4 transform group-hover:rotate-6 transition-transform duration-500">
                <span className="text-2xl sm:text-3xl">📋</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 px-4">
                Информация о ролях и учетных записях
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 max-w-2xl mx-auto px-4">
                Используйте эти учетные данные для тестирования. Пароли следует сменить при первом входе.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-gray-900">
              <div className="group relative bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">S</div>
                    <h4 className="text-base sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Системный администратор</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                  Полный контроль над платформой, безопасностью и расписанием персонала.
                </p>
                  <div className="text-xs sm:text-sm space-y-1 sm:space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-100">
                    <p className="break-all"><span className="font-bold text-blue-700">Логин:</span> <span className="text-gray-800 font-mono">sysadmin@sportsclub.com</span></p>
                    <p><span className="font-bold text-blue-700">Пароль:</span> <span className="text-gray-800 font-mono">sysadmin123</span></p>
                  </div>
                </div>
              </div>
              <div className="group relative bg-white/60 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 hover:bg-white/80 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">A</div>
                    <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Администратор</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Управление клиентами, услугами, записями и платежами.
                </p>
                  <div className="text-sm space-y-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                    <p><span className="font-bold text-purple-700">Логин:</span> <span className="text-gray-800 font-mono">admin@sportsclub.com</span></p>
                    <p><span className="font-bold text-purple-700">Пароль:</span> <span className="text-gray-800 font-mono">admin123</span></p>
                  </div>
                </div>
              </div>
              <div className="group relative bg-white/60 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 hover:bg-white/80 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">T</div>
                    <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Тренер</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Рабочий кабинет с личным расписанием тренировок и обратной связью.
                </p>
                  <div className="text-sm space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                    <p><span className="font-bold text-green-700">Логин:</span> <span className="text-gray-800 font-mono">trainer@sportsclub.com</span></p>
                    <p><span className="font-bold text-green-700">Пароль:</span> <span className="text-gray-800 font-mono">trainer123</span></p>
                  </div>
                </div>
              </div>
              <div className="group relative bg-white/60 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 hover:bg-white/80 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/20 hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">M</div>
                    <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Массажист</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Управление расписанием сеансов и свободными окнами.
                </p>
                  <div className="text-sm space-y-2 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100">
                    <p><span className="font-bold text-orange-700">Логин:</span> <span className="text-gray-800 font-mono">masseur@sportsclub.com</span></p>
                    <p><span className="font-bold text-orange-700">Пароль:</span> <span className="text-gray-800 font-mono">masseur123</span></p>
                  </div>
                </div>
              </div>
              <div className="group relative bg-white/60 backdrop-blur-sm border border-cyan-200/50 rounded-2xl p-6 md:col-span-2 text-center hover:bg-white/80 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">C</div>
                    <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Клиент</h4>
                  </div>
                  <p className="text-base text-gray-700 max-w-2xl mx-auto">
                  Личный кабинет с доступом к услугам, записям и истории посещений. Клиентов регистрирует
                  администратор, поэтому отдельные тестовые логины и пароли не требуются.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center text-white hover:shadow-blue-500/50 transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">🏋️‍♂️</div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">Управление услугами</h3>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Добавляйте и управляйте услугами спортивного клуба
              </p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center text-white hover:shadow-purple-500/50 transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">👥</div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">База клиентов</h3>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
              Ведите учет всех клиентов и их членства
            </p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center text-white hover:shadow-green-500/50 transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">📊</div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">Отчеты и аналитика</h3>
              <p className="text-green-100 text-sm sm:text-base leading-relaxed">
              Получайте подробные отчеты о работе клуба
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
