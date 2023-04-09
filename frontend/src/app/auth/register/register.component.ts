import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  accept: boolean = false;
  termsChecked: boolean = false;
  userForm!: FormGroup;
  formSubmit: boolean = false;
  emailExists: boolean = false;

  @ViewChild('check') check!: ElementRef;
  @ViewChild('termsAndConditions') termsAndConditions!: ElementRef;
  @ViewChild('privacyPolicy') privacyPolicy!: ElementRef;

   constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  )
  {
    this.userForm = this.fb.group({
      email: ['', [ Validators.required, Validators.email]],
      password: ['', [ Validators.required, this.passwordValidator()] ],
      userName: ['', Validators.required ]
    });
  }

  ngOnInit(): void {

  }

  register() {
    if(this.userForm.valid){
      this.authService.register(this.userForm.value)
      .subscribe({
        next: res => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Registro de usuario con éxito',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['/login']);
        },
        error: error => {
          const emailExists$: Observable<boolean> = of(true);

          emailExists$.subscribe((exists) => {
            this.emailExists = exists;

            if (exists) {
              setTimeout(() => {
                this.emailExists = false;
              }, 5000);
            }
          });
        }
      });
    }
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
      const valid = passwordRegex.test(control.value);
      return valid ? null : { invalidPassword: true };
    };
  }

  acceptTerms() {
    if(this.check.nativeElement.checked){
      this.accept = true;
      this.termsChecked = true;
    }
    else {
      this.accept = false;
    }
  }

  closeTerms() {
    this.termsChecked = false;
  }

  scrollToTermsAndConditions(element: string) {
    this.termsChecked = true;
    setTimeout(() => {
      if(element === 'termsAndConditions'){
        this.termsAndConditions.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
      else {
        this.privacyPolicy.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    },100);
  }

}
