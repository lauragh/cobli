import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  errorLogin !: String;
  user !: any;
  savedEmail: boolean = false;

  @ViewChild('aviso') aviso!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer2: Renderer2

  )
  {}

  ngOnInit(): void {
    this.user = {
      email: localStorage.getItem('remember') === 'true' ? localStorage.getItem('email') : '',
      password: '',
      remember: localStorage.getItem('remember') === 'true' ? true : false,
    };
  }

  login() {
    this.authService.login(this.user)
      .subscribe({
        next: res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('uid', res.uid);
          localStorage.setItem('remember', this.user.remember.toString());
          localStorage.setItem('email', this.user.email);
          this.router.navigate(['/gallery']);
        },
        error: error => {
          this.renderer2.removeClass(this.aviso.nativeElement, 'ocultar');
          this.renderer2.addClass(this.aviso.nativeElement, 'ver');
          this.errorLogin = error.error;
        }
      });
  }

  saveEmail(value: boolean){
    this.user.remember = value;
  }

}

