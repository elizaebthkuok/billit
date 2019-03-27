import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthRoutingModule } from './auth-routing.module';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    AuthRoutingModule,
    MaterialModule
  ]
})
export class AuthModule {}
