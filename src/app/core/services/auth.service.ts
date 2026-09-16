import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, delay } from 'rxjs/operators';
import { of } from 'rxjs';

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private _isAuthenticated = signal<boolean>(false);
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  
  private _userEmail = signal<string>('');
  public readonly userEmail = this._userEmail.asReadonly();

  private _userRole = signal<string>('');
  public readonly userRole = this._userRole.asReadonly();

  constructor() {
    this.checkToken();
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    if (token) {
      this._isAuthenticated.set(true);
      if (email) this._userEmail.set(email);
      if (role) this._userRole.set(role);
    }
  }

  login(credentials: { email: string; password: string }) {
    if (environment.useMocks) {
      // Pour les tests sans backend
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('email', credentials.email);
      this._isAuthenticated.set(true);
      this._userEmail.set(credentials.email);
      this._userRole.set('ADMIN'); // En mode mock, on force admin
      
      const mockResponse: AuthResponse = {
        token: 'fake-jwt-token',
        email: credentials.email,
        role: 'ADMIN'
      };
      
      return of(mockResponse).pipe(delay(500));
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
          
          this._isAuthenticated.set(true);
          this._userEmail.set(response.email);
          this._userRole.set(response.role);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this._isAuthenticated.set(false);
    this._userEmail.set('');
  }
}
