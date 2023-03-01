import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private URL = environment.apiURL;
  private user: any;
  private isAuthenticated = new BehaviorSubject<boolean>(false);

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
        this.user = res;
      })
    );
  }

  getId(){
    return this.user.uid;
  }

  getName(){
    return this.user.nombre;
  }

  getEmail(){
    return this.user.apellidos;
  }

  getColorBlind(){
    return this.user.colorBlindness;
  }

  getOcuppation(){
    return this.user.occupation;
  }

  getDateRegistration(){
    return this.user.dateRegistration;
  }

  getImages(){
    return this.user.images;

  }
}
