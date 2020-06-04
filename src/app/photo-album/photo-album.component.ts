import { Component, OnInit } from '@angular/core';
import {
  AngularFirestoreDocumet,
  AngularFirestore,
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-photo-album',
  templateUrl: './photo-album.component.html',
  styleUrls: ['./photo-album.component.css'],
})
export class PhotoAlbumComponent implements OnInit {
  user;
  photo = { file: '', title: '' };
  photoServerURL;
  uploadedImgURL = '';

  constructor(
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe((user) => {
      this.user = user;
    });
  }

  onFileChange(e) {
    console.log(e.target.files[0]);
    this.photo.file = e.target.files[0];
  }

  postPhoto() {
    console.log(this.photo);
    const uid = this.user.uid;
    const photoPathOnServer = `personal-space/${uid}/${this.photo.title}`;
    const photoRef = this.afStorage.ref(photoPathOnServer);
    this.photoServerURL = '';

    console.log('photoPathOnServer', photoPathOnServer);
    console.log('uid', uid);
    console.log('this.photo.file', this.photo.file);
    console.log('this.photo.title', this.photo.title);

    const currentUpload = this.afStorage.upload(
      photoPathOnServer,
      this.photo.file
    );

    currentUpload.catch((err) => console.error(err));

    currentUpload
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.photoServerURL = photoRef.getDownloadURL();
          console.log('photoServerURL >>>> ', this.photoServerURL);

          this.photoServerURL.subscribe((data) => {
            console.log('data >>> ', data);
            this.uploadedImgURL = data;
          });
        })
      )
      .subscribe();

    // clear form
    this.photo = { fileName: '', title: '' };
  }
}
