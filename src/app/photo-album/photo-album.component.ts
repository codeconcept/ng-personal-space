import { Component, OnInit } from '@angular/core';
import {
  AngularFirestoreDocument,
  AngularFirestore,
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';

import { finalize } from 'rxjs/operators';
import { DbService } from './../services/db.service';

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
  personalSpace;

  constructor(
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage,
    private db: DbService
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      console.log('user', user);

      this.user = user;
      if (this.user) {
        // console.log(this.db.readPersonalSpaceByUID(user.uid));

        this.db.readPersonalSpaceByUID(user.uid).subscribe(
          (data) => {
            console.log('ngOnInt readPersonnalSpaceById / data', data);
            this.personalSpace = data;
            if (!data || data.length === 0) {
              console.log(`Creating a new space for ${user.displayName}`);
              this.db.createPersonalSpace(this.user);
            }
          },
          (err) => {
            console.error('readPersonalSpaceById error', err);
          }
        );
      }
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
          this.photoServerURL.subscribe((data) => {
            console.log('data >>> ', data);
            this.uploadedImgURL = data;
            this.db.updatePersonalSpacePhotoURLs(
              this.user,
              this.uploadedImgURL
            );
          });
        })
      )
      .subscribe();

    // clear form
    this.photo = { file: '', title: '' };
  }
}
