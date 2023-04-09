import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

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
  token!: string;

  @ViewChild('profile') profile!: ElementRef;


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private renderer2: Renderer2
  ) {}

  async ngOnInit() {
    await this.checkUid();
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
    this.userLoaded = false;
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  async cargarUsuario(): Promise<void> {
    while (this.authService.getToken() == null) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.token = this.authService.getToken();
      this.uid = this.authService.getUid();
    }

    console.log('cargo usuario', this.uid);
    if(this.authService.getUid() && this.authService.getToken()){
      this.uid = this.authService.getUid();

      this.userService.getUser(this.uid)
      .subscribe({
        next: res => {
          this.name = res.user.name;
          this.userLoaded = true;

        },
        error: error => {
          console.log(error);
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo cargar el usuario',});
        }
      });

      // this.userService.getUser(this.uid).subscribe(res => {
      //   this.name = res['user'].name;
      //   this.userLoaded = true;
      // });
    }
  }

  async checkUid(){
    while (!this.uid) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.uid = this.authService.getUid();
    }
    console.log('consigo uid', this.uid);
  }

  showProfile() {
    this.renderer2.removeClass(this.profile.nativeElement, 'ocultar');
    this.renderer2.addClass(this.profile.nativeElement, 'ver');
  }

  closeProfile(){
    this.renderer2.removeClass(this.profile.nativeElement, 'ver');
    this.renderer2.addClass(this.profile.nativeElement, 'ocultar');
  }

}
