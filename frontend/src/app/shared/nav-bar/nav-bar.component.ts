import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  isLoggedIn: boolean = false;
  name!: string;
  uid!: string;


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    // this.authService.autentificar();
    this.checkLogin();
  }

  checkLogin(): void {
    this.authService.checkLogin.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        console.log('autentificado', isAuthenticated);
        this.isLoggedIn = true;
        setTimeout(() =>{
          if(this.authService.checkSesion()){
            this.cargarUsuario();
          }
      }, 500);
      } else {
        console.log('no autentificado', isAuthenticated);
        this.isLoggedIn = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
    console.log(this.isLoggedIn);
    console.log(this.name);

  }

  cargarUsuario(): void {
    this.uid = this.authService.getUid();
    console.log('uid',this.uid);

    this.userService.getUser(this.uid).subscribe(res => {
      this.name = res['name'];
      console.log(this.name);
    });
  }

}
