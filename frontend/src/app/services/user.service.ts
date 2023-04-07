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
  private user = new BehaviorSubject<User>({uid: '', name: '', email: '', password: '', colorBlindness: '', occupation: '', dateRegistration: '', images: []});

  constructor(private http: HttpClient) { }


  login(user: any){
    this.isAuthenticated.next(true);
    return this.http.post<any>(this.URL + '/login', user);
  }

  getUser(uid: string){
    console.log(this.URL, uid);
    return this.http.get<any>(this.URL + '/users/' + uid)
    .pipe(
      tap((res : any) => {
        console.log(res);
        this.user.next(res.user);
      })
    );
  }

  changePassword(data: any){
    console.log(data);
    return this.http.put<any>(this.URL + '/newPassword/', data)
  }

  getUserData(){
    return this.user;
  }

  getId(){
    this.user.subscribe(u => {
      return u.uid;
    });
  }

  getName(){
    this.user.subscribe(u => {
      return u.name;
    });
  }

  getEmail(){
    this.user.subscribe(u => {
      return u.email;
    });
  }

  getColorBlind(){
    this.user.subscribe(u => {
      return u.colorBlindness;
    });
  }

  getOcuppation(){
    this.user.subscribe(u => {
      return u.occupation;
    });
  }

  getDateRegistration(){
    this.user.subscribe(u => {
      return u.dateRegistration;
    });
  }

  getImages(){
    this.user.subscribe(u => {
      return u.images;
    });
  }
}
