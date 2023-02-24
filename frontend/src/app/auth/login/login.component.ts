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
  user = {
    email: '',
    password: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,

    private router: Router,
  )
  {}

  ngOnInit(): void {
  }

  login() {
    this.authService.login(this.user)
      .subscribe({
        next: res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('uid', res.uid);
          console.log('al hacer login', localStorage.getItem('token'));
          this.router.navigate(['/gallery']);
        },
        error: error => {
          this.errorLogin = error.error;
        }
      });
  }

}

