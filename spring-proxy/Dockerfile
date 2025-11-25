# Dockerfile для Spring Boot прокси
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Копируем pom.xml и загружаем зависимости
COPY pom.xml .
RUN mvn dependency:go-offline

# Копируем исходники и собираем
COPY src ./src
RUN mvn clean package -DskipTests

# Production образ
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Копируем собранный JAR
COPY --from=build /app/target/sports-club-proxy-1.0.0.jar app.jar

# Expose порт
EXPOSE 8080

# Запуск приложения
ENTRYPOINT ["java", "-jar", "app.jar"]

