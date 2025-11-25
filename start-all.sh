#!/bin/bash

# ==============================================
# Скрипт запуска всего приложения
# Next.js + Spring Boot Proxy
# Программа учёта услуг спортивного клуба
# ==============================================

echo "=================================================="
echo "   🏋️ СПОРТИВНЫЙ КЛУБ"
echo "   Программа учёта услуг"
echo "=================================================="
echo ""

# Проверка Java
if ! command -v java &> /dev/null; then
    echo "❌ Java не установлена!"
    echo "   Смотрите инструкцию: spring-proxy/INSTALL_JAVA.md"
    echo ""
    echo "Быстрая установка через Homebrew:"
    echo "   brew install openjdk@21"
    echo ""
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    exit 1
fi

echo "✅ Java: $(java -version 2>&1 | head -n 1)"
echo "✅ Node: $(node -v)"
echo ""

# Запуск Next.js в фоне
echo "🚀 Запуск Next.js на порту 3000..."
cd /Users/kseniagrishaeva/Downloads/webApp
npm run dev &
NEXTJS_PID=$!
echo "   PID: $NEXTJS_PID"

# Ждём запуска Next.js
echo "⏳ Ожидание запуска Next.js..."
sleep 5

# Проверка что Next.js запустился
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Next.js успешно запущен"
else
    echo "⚠️  Next.js ещё запускается..."
fi

echo ""
echo "🚀 Запуск Spring Boot прокси на порту 8080..."
cd /Users/kseniagrishaeva/Downloads/webApp/spring-proxy
./mvnw spring-boot:run &
SPRING_PID=$!
echo "   PID: $SPRING_PID"

echo ""
echo "=================================================="
echo "✅ Оба сервера запущены!"
echo ""
echo "🌐 Next.js:     http://localhost:3000"
echo "🌐 Spring Boot: http://localhost:8080 (прокси)"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo "=================================================="

# Ожидание завершения
wait $NEXTJS_PID $SPRING_PID

