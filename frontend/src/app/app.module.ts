import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';import { GuardsComponent } from './guards/guards.component';
import { InterfacesComponent } from './interfaces/interfaces.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EditorComponent } from './pages/editor/editor.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { Error404Component } from './components/errors/error404.component';

@NgModule({
  declarations: [
    AppComponent,
    GuardsComponent,
    InterfacesComponent,
    LoginComponent,
    RegisterComponent,
    RecoveryComponent,
    NavBarComponent,
    FooterComponent,
    GalleryComponent,
    EditorComponent,
    ProfileComponent,
    ChangePasswordComponent,
    LandingPageComponent,
    Error404Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
