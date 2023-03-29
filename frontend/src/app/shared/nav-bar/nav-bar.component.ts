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
  ) {}

  ngOnInit() {
    this.checkLogin(() => {
      this.cargarUsuario();
    });
  }

  checkLogin(callback: () => void): void {
    this.authService.checkLogin().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.isLoggedIn = true;
        callback();
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  cargarUsuario(): void {
    this.uid = this.authService.getUid();
    if(this.uid){
      this.userService.getUser(this.uid).subscribe(res => {
        this.name = res['user'].name;
      });
    }
  }

  showProfile() {

  }

}
