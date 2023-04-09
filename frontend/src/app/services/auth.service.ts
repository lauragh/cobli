import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private URL = environment.apiURL;
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const isAuthenticated = localStorage.getItem('token');
    if (isAuthenticated) {
      this.isAuthenticated.next(true);
    }
  }


  login(user: any) {
    this.isAuthenticated.next(true);
    return this.http.post<any>(this.URL + '/login', user);
  }

  register(user: any) {
    return this.http.post<any>(this.URL + '/users', user);
  }

  logout() {
    this.isAuthenticated.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
  }

  checkLogin(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  getToken() {
    return localStorage.getItem('token') as any;
  }

  getUid() {
    return localStorage.getItem('uid') as any;
  }

}

