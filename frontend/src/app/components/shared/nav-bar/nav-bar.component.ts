import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';

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
  profileShow: boolean = false;
  hidden: boolean = false;

  @ViewChild('profile') profile!: ElementRef;


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    localStorage.setItem('imageLoaded', 'false');
    localStorage.setItem('projectSaved', 'false');

    this.router.events
    .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    .subscribe((ev: NavigationEnd) => {
      let url = ev.url;
      if (url.includes('login') || url.includes('register')) {
        this.hidden = true;
      } else {
        console.log('Entro en', url);
        this.hidden = false;
      }
    });

    this.checkLogin(() => {
      this.cargarUsuario();
    });
  }

  checkLogin(callback: () => void): void {
    this.authService.checkLogin().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        callback();
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  logout(): void {
    this.authService.logout()
    .subscribe({
      next: res => {
        this.userLoaded = false;
        this.isLoggedIn = false;
        this.name = '';
        this.router.navigate(['/login']);
      },
      error: error => {
        console.log(error);
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo hacer logout',});
      }
    });

  }

  async cargarUsuario(): Promise<void> {
    while (this.authService.getToken() == null) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.token = this.authService.getToken();
      this.uid = this.authService.getUid();
    }

    if(this.authService.getUid() && this.authService.getToken()){
      this.uid = this.authService.getUid();

      this.userService.getUser(this.uid)
      .subscribe({
        next: res => {
          this.name = res.user.name;
          this.userLoaded = true;
          this.isLoggedIn = true;
        },
        error: error => {
          console.log(error);
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo cargar el usuario',});
        }
      });
    }
  }

  goToLink(page: string){
    if(this.location.path().includes("editor") && localStorage.getItem('projectSaved') === 'false' && localStorage.getItem('imageUrl')){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-secondary me-4 me-4'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire({
        title: 'Cancela Imagen',
        text: `Se van a perder los cambios sin guardar. ¿Desea continuar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.clearLocalStorage();
          this.router.navigate([`/${page}`]);
        }
      });
    }
    else{
      this.clearLocalStorage();
      this.router.navigate([`/${page}`]);
    }
  }

  clearLocalStorage(){
    if(localStorage.getItem('imageUrl')){
      localStorage.removeItem('imageUrl');
    }
    if(localStorage.getItem('tagColors')){
      localStorage.removeItem('tagColors');
    }
    if(localStorage.getItem('projectName')){
      localStorage.removeItem('projectName');
    }
    localStorage.setItem('imageLoaded', 'false');
    localStorage.setItem('projectSaved', 'false');
  }

  showProfile() {
    this.profileShow = true;
  }

  closeProfile(){
    this.profileShow = false;
  }


}
