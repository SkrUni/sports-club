# 🔧 Установка Java на Mac M4 (Apple Silicon)

## Вариант 1: Через Homebrew (рекомендуется)

### Шаг 1: Установка Homebrew

Откройте Terminal и выполните:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

После установки добавьте в PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Шаг 2: Установка Java 21

```bash
brew install openjdk@21
```

Создание символической ссылки:

```bash
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

Добавление в PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Шаг 3: Проверка

```bash
java -version
```

---

## Вариант 2: Скачать напрямую с Oracle

1. Перейдите на: https://www.oracle.com/java/technologies/downloads/#jdk21-mac
2. Скачайте **ARM64 DMG Installer** для macOS
3. Откройте DMG файл и следуйте инструкциям

---

## Вариант 3: Через SDKMAN

```bash
# Установка SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Установка Java
sdk install java 21.0.1-tem
```

---

## После установки Java

### Установка Maven Wrapper

В папке spring-proxy выполните:

```bash
cd /Users/kseniagrishaeva/Downloads/webApp/spring-proxy
mvn -N wrapper:wrapper
```

### Запуск проекта

**Терминал 1 - Next.js:**
```bash
cd /Users/kseniagrishaeva/Downloads/webApp
npm run dev
```

**Терминал 2 - Spring Boot:**
```bash
cd /Users/kseniagrishaeva/Downloads/webApp/spring-proxy
./mvnw spring-boot:run
```

**Откройте в браузере:**
```
http://localhost:8080
```

