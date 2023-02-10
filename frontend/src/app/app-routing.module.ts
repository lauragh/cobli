import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EditorComponent } from './pages/editor/editor.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { Error404Component } from './components/errors/error404.component';

const routes: Routes = [
  { path: 'landing', component: LandingPageComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'recovery', component: RecoveryComponent},
  { path: 'gallery', component: GalleryComponent},
  { path: 'gallery/:id', component: GalleryComponent},
  { path: 'editor', component: EditorComponent},
  { path: '404', component: Error404Component},
  { path: '', redirectTo: '/landing', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
