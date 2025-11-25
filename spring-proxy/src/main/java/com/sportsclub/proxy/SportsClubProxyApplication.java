package com.sportsclub.proxy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Главный класс Spring Boot приложения.
 * Этот сервер выступает как reverse proxy (обратный прокси)
 * для Next.js приложения учёта услуг спортивного клуба.
 * 
 * Архитектура:
 * [Клиент] -> [Spring Boot :8080] -> [Next.js :3000]
 * 
 * @author Ксения Гришаева
 * @version 1.0.0
 */
@SpringBootApplication
public class SportsClubProxyApplication {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   СПОРТИВНЫЙ КЛУБ - ПРОКСИ СЕРВЕР");
        System.out.println("   Spring Boot Reverse Proxy Server");
        System.out.println("=================================================");
        System.out.println("Запуск сервера на порту 8080...");
        System.out.println("Проксирование запросов к Next.js на порту 3000");
        System.out.println("-------------------------------------------------");
        
        SpringApplication.run(SportsClubProxyApplication.class, args);
        
        System.out.println("-------------------------------------------------");
        System.out.println("✅ Сервер успешно запущен!");
        System.out.println("🌐 Откройте в браузере: http://localhost:8080");
        System.out.println("=================================================");
    }
}

