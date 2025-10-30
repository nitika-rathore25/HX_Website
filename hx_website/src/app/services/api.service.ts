import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private basePath = environment.apiBaseUrl;


    getFilters<T>(): Observable<T> {
        let payload = {}
        return this.http.post<T>(`${this.basePath}/filter`, payload).pipe(
            catchError((err) => {
                return throwError(() => err);
            })
        );
    }

    getAgents<T>(selectedFilters: JSON): Observable<T> {
        let payload = { selectedFilters: selectedFilters };
        return this.http.post<T>(`${this.basePath}/get/agents`, payload).pipe(
            catchError((err) => {
                return throwError(() => err);
            })
        );
    }

    getAgentDetails<T>(selectedFilters: JSON): Observable<T> {
        let payload = { selectedFilters: selectedFilters };
        return this.http.post<T>(`${this.basePath}/get/agents/details`, payload).pipe(
            catchError((err) => {
                return throwError(() => err);
            })
        );
    }


}


