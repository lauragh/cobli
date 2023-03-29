import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user-interface';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnChanges {
  user!: User;
  userForm: FormGroup;
  @Input() userLoaded!: boolean;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService

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

  loadUser(){
    let user: any = '';

    this.userService.getUserData().subscribe(data => {
      user = data;



    });

    const uid = this.authService.getUid();
    this.userForm.get('uid')?.setValue(uid);
    // this.userForm.patchValue({

    // });
    console.log(user);
    console.log(this.userForm.value);

  }

}
