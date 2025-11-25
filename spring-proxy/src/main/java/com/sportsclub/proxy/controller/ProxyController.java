package com.sportsclub.proxy.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

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
    private String nextJsServerUrl;

    private final RestTemplate restTemplate;

    public ProxyController() {
        this.restTemplate = new RestTemplate();
        System.out.println("=================================================");
        System.out.println("🔗 Next.js URL: " + nextJsServerUrl);
        System.out.println("=================================================");
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
                    
        } catch (Exception e) {
            System.err.println("❌ Ошибка проксирования: " + e.getMessage());
            e.printStackTrace();
            
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_JSON);
            String errorJson = "{\"error\":\"Ошибка прокси: " + e.getMessage().replace("\"", "\\\"") + "\"}";
            
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
            if (responseBody != null && !responseBody.isEmpty()) {
                // Пытаемся распарсить JSON
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> errorMap = mapper.readValue(responseBody, Map.class);
                
                if (errorMap.containsKey("error")) {
                    return "{\"error\":\"" + errorMap.get("error").toString().replace("\"", "\\\"") + "\"}";
                }
                
                // Если это уже валидный JSON, возвращаем как есть
                if (responseBody.trim().startsWith("{")) {
                    return responseBody;
                }
            }
        } catch (Exception parseException) {
            System.err.println("⚠️ Не удалось распарсить ответ об ошибке: " + parseException.getMessage());
        }
        
        // Если не удалось распарсить, возвращаем общее сообщение
        return "{\"error\":\"" + e.getStatusText() + "\"}";
    }
    
    /**
     * Извлекает сообщение об ошибке из HTTP исключения сервера
     */
    private String extractErrorMessage(HttpServerErrorException e) {
        try {
            String responseBody = e.getResponseBodyAsString();
            if (responseBody != null && !responseBody.isEmpty()) {
                // Пытаемся распарсить JSON
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> errorMap = mapper.readValue(responseBody, Map.class);
                
                if (errorMap.containsKey("error")) {
                    return "{\"error\":\"" + errorMap.get("error").toString().replace("\"", "\\\"") + "\"}";
                }
                
                // Если это уже валидный JSON, возвращаем как есть
                if (responseBody.trim().startsWith("{")) {
                    return responseBody;
                }
            }
        } catch (Exception parseException) {
            System.err.println("⚠️ Не удалось распарсить ответ об ошибке: " + parseException.getMessage());
        }
        
        // Если не удалось распарсить, возвращаем общее сообщение
        return "{\"error\":\"" + e.getStatusText() + "\"}";
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

