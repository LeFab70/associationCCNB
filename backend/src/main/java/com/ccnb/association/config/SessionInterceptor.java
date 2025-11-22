package com.ccnb.association.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SessionInterceptor implements HandlerInterceptor {
    
    // Endpoints publics (pas d'authentification requise)
    private static final String[] PUBLIC_PATHS = {
        "/api/students/start-creation",
        "/api/students/complete-info",
        "/api/students/send-validation-code",
        "/api/students/verify-code",
        "/api/students/set-password",
        "/api/students/login",
        "/api/students/check-auth",  // Public pour vérifier l'authentification
        "/api/admins/login",
        "/api/admin/check-auth",  // Public pour vérifier l'authentification
        "/api-docs",
        "/swagger-ui"
    };
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Laisser passer les requêtes OPTIONS (preflight CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        
        String path = request.getRequestURI();
        
        // Vérifier si c'est un endpoint public
        for (String publicPath : PUBLIC_PATHS) {
            if (path.startsWith(publicPath)) {
                return true;
            }
        }
        
        // Vérifier si c'est une route API
        if (!path.startsWith("/api/")) {
            return true; // Laisser passer les routes non-API
        }
        
        HttpSession session = request.getSession(false);
        
        // Vérifier si l'utilisateur est authentifié (admin ou étudiant)
        if (session == null || (session.getAttribute("studentEmail") == null && session.getAttribute("adminUsername") == null)) {
            // Ajouter les en-têtes CORS avant de bloquer
            String origin = request.getHeader("Origin");
            if (origin != null && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.setHeader("Access-Control-Allow-Headers", "*");
            }
            
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Vous devez être connecté pour accéder à cette ressource\"}");
            return false;
        }
        
        return true;
    }
}

