package com.ccnb.association.exceptions;

public class ResourceAlreadyExist extends RuntimeException {
    
    public ResourceAlreadyExist(String message) {
        super(message);
    }
    
    public ResourceAlreadyExist(String message, Throwable cause) {
        super(message, cause);
    }
}

