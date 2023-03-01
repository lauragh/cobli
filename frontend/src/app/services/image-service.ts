import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private URL = environment.apiURL;
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  getImages(userId: string){
    return this.http.get<any>(this.URL + '/users/' + userId + '/images')
  }

  deleteImage(userId: string, imageId: string){
    return this.http.delete<any>(this.URL + '/users/' + userId + '/images/' + imageId)
  }

  getImage(userId: string, imageId: string){
    return this.http.get<any>(this.URL + '/users/' + userId + '/images/' + imageId)
  }

}
