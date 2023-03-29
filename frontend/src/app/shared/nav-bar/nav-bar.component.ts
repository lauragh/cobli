import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  userLoaded: boolean = false;

  @ViewChild('profile') profile!: ElementRef;


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private renderer2: Renderer2
  ) {}

  ngOnInit() {
    this.checkUid();
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
    console.log('cargo usuario');
    this.uid = this.authService.getUid();

    if(this.uid){
      this.userService.getUser(this.uid).subscribe(res => {
        this.name = res['user'].name;
        this.userLoaded = true;
      });
    }
  }

  async checkUid(){
    while (!this.uid) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.uid = this.authService.getUid();
    }
  }

  showProfile() {
    this.renderer2.removeClass(this.profile.nativeElement, 'ocultar');
    this.renderer2.addClass(this.profile.nativeElement, 'ver');
  }

}
