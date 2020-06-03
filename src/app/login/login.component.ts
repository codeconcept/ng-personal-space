import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  result;

  constructor(private afAuth: AngularFireAuth) {}

  ngOnInit(): void {}

  async loginWithGoogle() {
    console.log(auth);
    try {
      this.result = await this.afAuth.signInWithPopup(
        new auth.GoogleAuthProvider()
      );
    } catch (error) {
      console.error('loginWithGoogle/error', error);
    }
  }
}
