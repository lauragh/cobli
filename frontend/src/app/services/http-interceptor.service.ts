import { Injectable } from '@angular/core';
import { HttpHandler, HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
// import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService {

  constructor(
    private router: Router,
    private authService: AuthService,
   ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        uid: `${this.authService.getUid()}`,
        'Content-Type': 'application/json'
      }
    });
    return next.handle(request).pipe(
      catchError(
        (err) => {
          if (err.status === 401) {
            this.authService.logout()
            .subscribe({
            next: res => {
              this.router.navigate(['/login']);
              return of(err);
            },
            error: error => {
            }
          });

          }
          throw err;
        }
      )
    );
  };

}
