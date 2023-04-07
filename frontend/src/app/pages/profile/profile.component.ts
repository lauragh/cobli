import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user-interface';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnChanges {
  user!: User;
  userForm: FormGroup;
  newPass: string = '';

  @Input() userLoaded!: boolean;
  @Output() buttonClicked = new EventEmitter<void>();

  @ViewChild('colorBlindness') colorBlindness!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private renderer2: Renderer2

  ) {
    this.userForm = this.fb.group({
      uid: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      colorBlindness: ['', Validators.required],
      occupation: ['', Validators.required],
      dateRegistration: ['', Validators.required],
      images: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userLoaded'] && changes['userLoaded'].currentValue === true) {
      this.loadUser();
    }
  }

  saveChanges(){

  }

  closeModal() {
    this.buttonClicked.emit();
  }

  loadUser(){
    let user: any = '';

    this.userService.getUserData().subscribe(data => {
      user = data;
    });

    const uid = this.authService.getUid();
    this.userForm.get('uid')?.setValue(uid);
    console.log(user.colorBlindness);
    this.colorBlindness.nativeElement.value = user.colorBlindness;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: user.password,
      colorBlindness: user.colorBlindness,
      occupation: user.occupation,
      dateRegistration: user.dateRegistration,
      images: user.images
    });
    console.log(user);
    console.log(this.userForm.value);
  }

  changePass(){
    const body = {
      email: this.userForm.get('email')?.value
    }
    this.userService.changePassword(body)
    .subscribe({
      next: res => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se ha enviado el reestablecimiento de la contraseña a su dirección de correo',
          showConfirmButton: false,
          timer: 1500
        })
      },
      error: error => {
        console.log('Error cambiando contraseña');
      }
    });
  }


}
