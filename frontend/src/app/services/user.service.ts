import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { User } from '../interfaces/user-interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private URL = environment.apiURL;
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }


  login(user: any){
    this.isAuthenticated.next(true);
    return this.http.post<any>(this.URL + '/login', user);
  }

  getUser(uid: string){
    return this.http.get<any>(this.URL + '/users/' + uid)
  }

  changePassword(data: any){
    return this.http.put<any>(this.URL + '/newPassword/', data)
  }

  updateNumImages(uid: string, data: any){
    return this.http.put<any>(this.URL + '/users/' + uid + '/updateNumImages', data)
  }

  updateUserProfile(uid: string, data: any){
    return this.http.put<any>(this.URL + '/users/' + uid, data)
  }
}
