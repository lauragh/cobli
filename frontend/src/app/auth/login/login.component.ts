import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  errorLogin !: String;
  user !: any;
  savedEmail: boolean = false;
  userForm!: FormGroup;

  @ViewChild('aviso') aviso!: ElementRef;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private renderer2: Renderer2,
    private fb: FormBuilder

  )
  {
    this.userForm = this.fb.group({
      email: [localStorage.getItem('remember') === 'true' ? localStorage.getItem('email') : '', [ Validators.required, Validators.email]],
      password: ['', Validators.required ],
      remember: [localStorage.getItem('remember') === 'true' ? true : false, Validators.required ]
    });
  }

  ngOnInit(): void {
  }

  login() {
    this.authService.login(this.userForm.value)
      .subscribe({
        next: res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('uid', res.uid);
          localStorage.setItem('remember', this.userForm.get('remember')!.value.toString());
          localStorage.setItem('email', this.userForm.get('email')!.value);
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
    this.userForm.get('remember')!.setValue(value);
  }

  resetPass(){
    const body = {
      email: this.user.email
    }

    this.userService.changePassword(body)
    .subscribe({
      next: res => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha enviado el reestablecimiento de la contraseña a su dirección de correo',
          showConfirmButton: false,
          timer: 4000
        })
      },
      error: error => {
        console.log('Error reseteando la contraseña');
      }
    });
  }

}

