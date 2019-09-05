import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public buttonId: string;

  constructor(
      protected router: Router,
  ) {
  }

  ngOnInit() {
  }

  public login() {
    this.router.navigate(['home', {buttonId: this.buttonId}]);
  }
}
