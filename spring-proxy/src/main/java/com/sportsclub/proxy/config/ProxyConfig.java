package com.sportsclub.proxy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Конфигурация прокси-сервера.
 * Настройка CORS и других параметров.
 */
@Configuration
public class ProxyConfig implements WebMvcConfigurer {

    /**
     * Настройка CORS для разрешения кросс-доменных запросов
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .maxAge(3600);
    }

    /**
     * Bean для HTTP клиента
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

