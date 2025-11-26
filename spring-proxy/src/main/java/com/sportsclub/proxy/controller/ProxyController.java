package com.sportsclub.proxy.controller;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Enumeration;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

/**
 * Контроллер прокси-сервера.
 * Перенаправляет все HTTP запросы к Next.js приложению.
 * 
 * Поддерживает:
 * - GET, POST, PUT, DELETE, PATCH запросы
 * - Передачу заголовков
 * - Передачу cookies
 * - Передачу тела запроса
 */
@RestController
public class ProxyController {

    @Value("${nextjs.server.url:http://localhost:3000}")
    private String nextJsServerUrlRaw;

    private String nextJsServerUrl;
    private final RestTemplate restTemplate;

    public ProxyController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Инициализация после инъекции зависимостей Spring
     */
    @PostConstruct
    public void init() {
        // Нормализуем URL: добавляем протокол, если его нет
        this.nextJsServerUrl = normalizeUrl(nextJsServerUrlRaw);
        System.out.println("=================================================");
        System.out.println("🔗 Next.js URL (исходный): " + nextJsServerUrlRaw);
        System.out.println("🔗 Next.js URL (нормализованный): " + nextJsServerUrl);
        System.out.println("=================================================");
    }

    /**
     * Нормализует URL: добавляет протокол https://, если его нет
     */
    private String normalizeUrl(String url) {
        if (url == null || url.isEmpty()) {
            return "http://localhost:3000";
        }
        
        // Если URL уже содержит протокол, возвращаем как есть
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        
        // Если URL не содержит протокол, добавляем https://
        // Это нужно для Render.com, где property: host возвращает только хост
        return "https://" + url;
    }

    /**
     * Обрабатывает все входящие запросы и проксирует их к Next.js
     */
    @RequestMapping(value = "/**")
    public ResponseEntity<byte[]> proxyRequest(
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body) {
        
        try {
            // Формируем URL для Next.js
            String targetUrl = buildTargetUrl(request);
            System.out.println("📡 Проксирование: " + request.getMethod() + " " + targetUrl);
            
            // Копируем заголовки
            HttpHeaders headers = copyHeaders(request);
            
            // Создаём запрос
            HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);
            
            // Определяем HTTP метод
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            
            // Выполняем запрос к Next.js
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    targetUrl,
                    method,
                    entity,
                    byte[].class
            );
            
            // Возвращаем ответ клиенту
            return ResponseEntity
                    .status(response.getStatusCode())
                    .headers(filterResponseHeaders(response.getHeaders()))
                    .body(response.getBody());
                    
        } catch (HttpClientErrorException e) {
            // Обрабатываем HTTP ошибки клиента (4xx)
            System.err.println("❌ HTTP ошибка клиента: " + e.getStatusCode() + " - " + e.getStatusText());
            
            String errorMessage = extractErrorMessage(e);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_JSON);
            
            return ResponseEntity
                    .status(e.getStatusCode())
                    .headers(responseHeaders)
                    .body(errorMessage.getBytes());
                    
        } catch (HttpServerErrorException e) {
            // Обрабатываем HTTP ошибки сервера (5xx)
            System.err.println("❌ HTTP ошибка сервера: " + e.getStatusCode() + " - " + e.getStatusText());
            
            String errorMessage = extractErrorMessage(e);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_JSON);
            
            return ResponseEntity
                    .status(e.getStatusCode())
                    .headers(responseHeaders)
                    .body(errorMessage.getBytes());
                    
        } catch (ResourceAccessException e) {
            // Ошибка подключения к Next.js (сервис недоступен, таймаут и т.д.)
            System.err.println("❌ Ошибка подключения к Next.js: " + e.getMessage());
            System.err.println("🔗 URL Next.js: " + nextJsServerUrl);
            e.printStackTrace();
            
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_JSON);
            String errorJson = "{\"error\":\"Сервис временно недоступен. Next.js сервер не отвечает. Попробуйте позже или обновите страницу.\"}";
            
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .headers(responseHeaders)
                    .body(errorJson.getBytes());
                    
        } catch (Exception e) {
            System.err.println("❌ Ошибка проксирования: " + e.getMessage());
            System.err.println("🔗 URL Next.js: " + nextJsServerUrl);
            e.printStackTrace();
            
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_JSON);
            String errorMessage = e.getMessage() != null ? e.getMessage().replace("\"", "\\\"") : "Неизвестная ошибка";
            String errorJson = "{\"error\":\"Ошибка сервера: " + errorMessage + "\"}";
            
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .headers(responseHeaders)
                    .body(errorJson.getBytes());
        }
    }
    
    /**
     * Извлекает сообщение об ошибке из HTTP исключения
     */
    private String extractErrorMessage(HttpClientErrorException e) {
        try {
            String responseBody = e.getResponseBodyAsString();
            System.err.println("📄 Тело ответа об ошибке: " + responseBody);
            
            if (responseBody != null && !responseBody.isEmpty()) {
                // Пытаемся распарсить JSON
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> errorMap = mapper.readValue(responseBody, Map.class);
                    
                    if (errorMap.containsKey("error")) {
                        String errorMsg = errorMap.get("error").toString();
                        System.err.println("✅ Извлечено сообщение об ошибке: " + errorMsg);
                        // Экранируем специальные символы для JSON
                        errorMsg = errorMsg.replace("\\", "\\\\")
                                          .replace("\"", "\\\"")
                                          .replace("\n", "\\n")
                                          .replace("\r", "\\r")
                                          .replace("\t", "\\t");
                        return "{\"error\":\"" + errorMsg + "\"}";
                    }
                } catch (Exception jsonException) {
                    System.err.println("⚠️ Ошибка парсинга JSON: " + jsonException.getMessage());
                }
                
                // Если это уже валидный JSON, возвращаем как есть
                if (responseBody.trim().startsWith("{")) {
                    System.err.println("✅ Возвращаем JSON как есть");
                    return responseBody;
                }
            }
        } catch (Exception parseException) {
            System.err.println("⚠️ Не удалось распарсить ответ об ошибке: " + parseException.getMessage());
            parseException.printStackTrace();
        }
        
        // Если не удалось распарсить, возвращаем общее сообщение
        String statusText = e.getStatusText() != null ? e.getStatusText() : "Bad Request";
        System.err.println("⚠️ Используем статус как сообщение: " + statusText);
        return "{\"error\":\"Ошибка валидации: " + statusText + "\"}";
    }
    
    /**
     * Извлекает сообщение об ошибке из HTTP исключения сервера
     */
    private String extractErrorMessage(HttpServerErrorException e) {
        try {
            String responseBody = e.getResponseBodyAsString();
            System.err.println("📄 Тело ответа об ошибке сервера: " + responseBody);
            
            if (responseBody != null && !responseBody.isEmpty()) {
                // Пытаемся распарсить JSON
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> errorMap = mapper.readValue(responseBody, Map.class);
                    
                    if (errorMap.containsKey("error")) {
                        String errorMsg = errorMap.get("error").toString();
                        System.err.println("✅ Извлечено сообщение об ошибке: " + errorMsg);
                        // Экранируем специальные символы для JSON
                        errorMsg = errorMsg.replace("\\", "\\\\")
                                          .replace("\"", "\\\"")
                                          .replace("\n", "\\n")
                                          .replace("\r", "\\r")
                                          .replace("\t", "\\t");
                        return "{\"error\":\"" + errorMsg + "\"}";
                    }
                } catch (Exception jsonException) {
                    System.err.println("⚠️ Ошибка парсинга JSON: " + jsonException.getMessage());
                }
                
                // Если это уже валидный JSON, возвращаем как есть
                if (responseBody.trim().startsWith("{")) {
                    System.err.println("✅ Возвращаем JSON как есть");
                    return responseBody;
                }
            }
        } catch (Exception parseException) {
            System.err.println("⚠️ Не удалось распарсить ответ об ошибке: " + parseException.getMessage());
            parseException.printStackTrace();
        }
        
        // Если не удалось распарсить, возвращаем общее сообщение
        String statusText = e.getStatusText() != null ? e.getStatusText() : "Internal Server Error";
        System.err.println("⚠️ Используем статус как сообщение: " + statusText);
        return "{\"error\":\"Ошибка сервера: " + statusText + "\"}";
    }

    /**
     * Формирует целевой URL для Next.js сервера
     */
    private String buildTargetUrl(HttpServletRequest request) {
        StringBuilder url = new StringBuilder(nextJsServerUrl);
        url.append(request.getRequestURI());
        
        if (request.getQueryString() != null) {
            url.append("?").append(request.getQueryString());
        }
        
        return url.toString();
    }

    /**
     * Копирует заголовки из входящего запроса
     */
    private HttpHeaders copyHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            // Пропускаем заголовки, которые не нужно проксировать
            if (!headerName.equalsIgnoreCase("host") &&
                !headerName.equalsIgnoreCase("content-length")) {
                headers.add(headerName, request.getHeader(headerName));
            }
        }
        
        return headers;
    }

    /**
     * Фильтрует заголовки ответа
     */
    private HttpHeaders filterResponseHeaders(HttpHeaders headers) {
        HttpHeaders filtered = new HttpHeaders();
        headers.forEach((name, values) -> {
            // Пропускаем технические заголовки
            if (!name.equalsIgnoreCase("transfer-encoding")) {
                filtered.addAll(name, values);
            }
        });
        return filtered;
    }
}

