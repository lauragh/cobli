import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  )
  {}

  ngOnInit(): void {
    this.user = {
      email: localStorage.getItem('remember') === 'true' ? localStorage.getItem('email') : '',
      password: '',
      remember: localStorage.getItem('remember') === 'true' ? true : false,
      // autocomplete: localStorage.getItem('remember') ? "on" : "off"
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
          // console.log('al hacer login', localStorage.getItem('token'));
          this.router.navigate(['/gallery']);
        },
        error: error => {
          this.errorLogin = error.error;
        }
      });
  }

  saveEmail(value: boolean){
    this.user.remember = value;
  }

}

