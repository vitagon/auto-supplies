import { Component, OnInit } from '@angular/core';
import {UserService} from "../../../core/services/user.service";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.logout();
  }

}