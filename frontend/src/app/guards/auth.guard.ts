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
    // private _snackBar: MatSnackBar
  ) { }

  canActivate(): boolean {

    return true;
    // if(this.authService.checkSesion()){
    //   console.log('tengo la sesion iniciada');
    //   return true;
    // }
    // else{
    //   this._snackBar.open("La sesión ha caducado", "Cerrar", {duration: 2500});
    //   this.router.navigate(['/login']);
    //   return false;
    // }
  }

}
