# 🏋️ Sports Club Proxy Server

## Spring Boot Reverse Proxy для приложения учёта услуг спортивного клуба

### 📋 Описание

Этот Spring Boot сервер работает как **reverse proxy** (обратный прокси-сервер), перенаправляя все HTTP-запросы к основному Next.js приложению.

### 🏗️ Архитектура

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Браузер   │ ──▶  │  Spring Boot     │ ──▶  │    Next.js      │
│   Клиент    │      │  Proxy :8080     │      │    App :3000    │
└─────────────┘      └──────────────────┘      └─────────────────┘
```

### 🔧 Требования

- **Java 17+** (рекомендуется Java 21 для Mac M4)
- **Maven 3.8+**
- **Node.js 18+** (для Next.js приложения)

### 📦 Установка Java на Mac M4

```bash
# Установка через Homebrew
brew install openjdk@21

# Или через SDKMAN
curl -s "https://get.sdkman.io" | bash
sdk install java 21.0.1-tem
```

### 🚀 Запуск

#### Шаг 1: Запустите Next.js приложение

```bash
# В корневой папке проекта
cd /Users/kseniagrishaeva/Downloads/webApp
npm run dev
# Приложение запустится на http://localhost:3000
```

#### Шаг 2: Запустите Spring Boot прокси

```bash
# В папке spring-proxy
cd /Users/kseniagrishaeva/Downloads/webApp/spring-proxy
./mvnw spring-boot:run
# Прокси запустится на http://localhost:8080
```

#### Шаг 3: Откройте в браузере

```
http://localhost:8080
```

### 📁 Структура проекта

```
spring-proxy/
├── pom.xml                          # Maven конфигурация
├── src/
│   └── main/
│       ├── java/
│       │   └── com/sportsclub/proxy/
│       │       ├── SportsClubProxyApplication.java  # Главный класс
│       │       ├── controller/
│       │       │   └── ProxyController.java         # Прокси контроллер
│       │       └── config/
│       │           └── ProxyConfig.java             # Конфигурация
│       └── resources/
│           ├── application.properties               # Настройки
│           └── application.yml                      # Настройки (YAML)
└── README.md
```

### ⚙️ Конфигурация

Основные параметры в `application.properties`:

| Параметр | Значение | Описание |
|----------|----------|----------|
| `server.port` | 8080 | Порт Spring Boot сервера |
| `nextjs.server.url` | http://localhost:3000 | URL Next.js приложения |

### 🔍 Мониторинг

Spring Boot Actuator endpoints:

- Health check: http://localhost:8080/actuator/health
- Info: http://localhost:8080/actuator/info
- Metrics: http://localhost:8080/actuator/metrics

### 🛠️ Сборка JAR файла

```bash
# Сборка
./mvnw clean package -DskipTests

# Запуск JAR
java -jar target/sports-club-proxy-1.0.0.jar
```

### 📝 Автор

Ксения Гришаева - Курсовая работа "Программирование учёта услуг спортивного клуба"

