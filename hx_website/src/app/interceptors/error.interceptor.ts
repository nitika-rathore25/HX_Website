import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastr = inject(ToastrService);

    return next(req).pipe(
        // retry(1), 
        catchError((error: HttpErrorResponse) => {
            let message = 'An unexpected error occurred';
            let title = 'Error';
            let showToast = true;

            // Handle different error types
            if (error.error instanceof ErrorEvent) {
                // Client-side/Network errors
                message = `Network Error: ${error.error.message}`;
                title = 'Connection Problem';
            }
            else {
                // Server-side errors
                switch (error.status) {
                    case 400:
                        message = error.error?.message ?? 'Invalid request data. Please check your input.';
                        title = 'Validation Error';
                        break;
                    case 401:
                        message = 'Your session has expired. Please login again.';
                        title = 'Session Expired';
                        break;
                    case 403:
                        message = 'You do not have permission to perform this action.';
                        title = 'Access Denied';
                        break;
                    case 404:
                        message = 'The requested resource was not found.';
                        title = 'Not Found';
                        break;
                    case 422:
                        message = error.error?.message ?? 'Validation failed. Please check your data.';
                        title = 'Validation Failed';
                        break;
                    case 429:
                        message = 'Too many requests. Please wait and try again.';
                        title = 'Rate Limited';
                        break;
                    case 500:
                        message = 'Internal server error. Please try again later.';
                        title = 'Server Error';
                        break;
                    case 502:
                        message = 'Bad gateway. The server is temporarily unavailable.';
                        title = 'Server Unavailable';
                        break;
                    case 503:
                        message = 'Service temporarily unavailable. Please try again later.';
                        title = 'Service Unavailable';
                        break;
                    case 504:
                        message = 'Request timeout. Please try again.';
                        title = 'Timeout';
                        break;
                    default:
                        if (error.error && typeof error.error === 'object') {
                            message = error.error.message ??
                                error.error.error ??
                                `Server Error ${error.status}`;
                        } else {
                            message = `HTTP Error ${error.status}: ${error.message}`;
                        }
                        title = 'API Error';
                }
            }

            // Optional: Skip toast for certain URLs
            const skipToastUrls = ['/api/silent-endpoint'];
            if (skipToastUrls.some(url => req.url.includes(url))) {
                showToast = false;
            }

            // Show toast notification
            if (showToast) {
                toastr.error(message, title, {
                    timeOut: 6000,
                    progressBar: true,
                    closeButton: true,
                    enableHtml: false,
                    positionClass: 'toast-top-right',
                });
            }

            // Enhanced logging
            console.error('HTTP Error Details:', {
                status: error.status,
                message: error.message,
                url: req.url,
                method: req.method,
                error: error.error,
                timestamp: new Date().toISOString()
            });

            return throwError(() => error);
        })
    );
};
