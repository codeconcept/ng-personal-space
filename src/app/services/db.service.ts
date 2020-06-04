import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { PersonalSpace } from './../models/personal-space';
import { firestore } from 'firebase';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private personalSpaceCollection: AngularFirestoreCollection<PersonalSpace>;
  personalSpaces: Observable<PersonalSpace[]>;

  constructor(private afs: AngularFirestore) {
    this.personalSpaceCollection = afs.collection<PersonalSpace>(
      'personal-spaces'
    );
    this.personalSpaces = this.personalSpaceCollection.valueChanges();
  }

  createPersonalSpace(user) {
    return this.personalSpaceCollection.doc(`ps-${user.uid}`).set({
      uid: user.uid,
      displayName: user.displayName,
      createdAt: Date.now(),
    });
  }

  readPersonalSpace(): Observable<PersonalSpace[]> {
    return this.personalSpaces;
  }

  readPersonalSpaceByUID(uid: string) {
    return this.afs
      .collection('personal-spaces', (ref) => ref.where('uid', '==', uid))
      .valueChanges({ idField: 'id' });
  }

  updatePersonalSpacePhotoURLs(user, photoURL) {
    return this.afs
      .collection('personal-spaces')
      .doc(`ps-${user.uid}`)
      .update({
        photoURLs: firestore.FieldValue.arrayUnion(photoURL),
      });
  }
}
