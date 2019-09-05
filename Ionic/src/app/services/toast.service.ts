import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
      protected toastController: ToastController
  ) {
  }

  public async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      position: 'top',
      duration: 3000,
      color: 'danger',
    });
    toast.present();
  }
}
