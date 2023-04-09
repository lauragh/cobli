import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
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
  uid!: string;
  sumbit: boolean = false;

  @Input() userLoaded!: boolean;
  @Output() buttonClicked = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
  ) {
    this.userForm = this.fb.group({
      uid: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      colorBlindness: ['', Validators.required],
      occupation: ['', Validators.required],
      dateRegistration: ['', Validators.required],
      dateLastAccess: ['', Validators.required],
      images: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.loadUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userLoaded'] && changes['userLoaded'].currentValue === true) {
      this.loadUser();
    }
  }

  saveChanges(){
    this.userForm.get('colorBlindness')?.setValue(this.userForm.get('colorBlindness')!.value || null);
    this.userForm.get('occupation')?.setValue(this.userForm.get('occupation')!.value || null);

    console.log(this.userForm.value);
    this.userService.updateUserProfile(this.uid, this.userForm.value)
    .subscribe({
      next: res => {
        this.sumbit = true;
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Perfil actualizado con éxito',
          showConfirmButton: false,
          timer: 1500
        });
        this.buttonClicked.emit();
        this.userForm.markAsPristine();
      },
      error: error => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo actualizar el perfil, vuelva a intentarlo',});
      }
    });
  }

  closeModal() {
    if(this.userForm.dirty && !this.sumbit){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-outline-secondary me-3'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire({
        text: `Se van a perder todos los cambios no guardados. ¿Desea continuar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.userForm.markAsPristine();
          this.buttonClicked.emit();
        }
      });
    }
    else{
      this.buttonClicked.emit();
    }
  }

  loadUser(){
    let user: any = '';

    this.userService.getUserData().subscribe(data => {
      user = data;
    });

    this.uid = this.authService.getUid();
    this.userForm.get('uid')?.setValue(this.uid);
    console.log(user.colorBlindness);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: user.password,
      colorBlindness: user.colorBlindness,
      occupation: user.occupation,
      dateRegistration: user.dateRegistration,
      dateLastAccess: user.dateLastAccess,
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
          title: 'Se ha enviado el restablecimiento de la contraseña a su dirección de correo',
          showConfirmButton: false,
          timer: 4000
        })
      },
      error: error => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se ha podido restablecer la contraseña, vuelva a intentarlo',});
      }
    });
  }


}
