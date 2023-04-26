import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from "../services/auth.service";
import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  acceso: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(): boolean {
    if(this.authService.getToken()){
      return true;
    }
    else{
      this.router.navigate(['/login']);
      return false;
    }
  }

}
