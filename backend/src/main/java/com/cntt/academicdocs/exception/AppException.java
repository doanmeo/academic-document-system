package com.cntt.academicdocs.exception;

import org.springframework.http.HttpStatus;

/**
 * Standard Application Exception for domain & storage errors.
 * Extends BusinessException to be automatically handled by GlobalExceptionHandler.
 */
public class AppException extends BusinessException {

    public AppException(HttpStatus httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }

    public AppException(String code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }
}
