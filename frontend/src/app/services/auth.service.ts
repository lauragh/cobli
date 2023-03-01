import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private URL = environment.apiURL;
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }


  login(user: any) {
    this.isAuthenticated.next(true);
    return this.http.post<any>(this.URL + '/login', user);
  }

  logout() {
    console.log('salgo');
    this.isAuthenticated.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
  }

  get checkLogin() {
    return this.isAuthenticated.asObservable();
  }

  autentificar() {
    this.isAuthenticated.next(true);
  }

  checkSesion() {
    if(localStorage.getItem('token') != null){
      return true;
    }
    else{
      return false;
    }
  }

  getToken() {
    // console.log('quiero el token', localStorage.getItem('token'));
    return localStorage.getItem('token') as any;
  }

  getUid() {
    return localStorage.getItem('uid') as any;
  }

}

