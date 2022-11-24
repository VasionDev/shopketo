import { Component, OnInit } from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { NotificationSettingUpdate } from '../models/notificationSettingUpdate';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  public notifications: Array<any> = [];
  public differ: any;
  public notificationSettingsUpdate: NotificationSettingUpdate = {
    collection: [],
  };
  public emailAll: boolean = false;
  public smsAll: boolean = false;
  public appAll: boolean = false;
  public loading: boolean = false;
  constructor(private newgenSvc: NewgenApiService) { }

  ngOnInit(): void {
    this.getNotificationsSettings();
  }

  getNotificationsSettings() {
    this.newgenSvc.getNotificationSettings().subscribe((x) => {
      let collection = x.collection;
      if (collection.some((y: any) => y.email == "on")) {
        this.emailAll = true;
      }
      if (collection.some((y: any) => y.sms == "on")) {
        this.smsAll = true;
      }
      if (collection.some((y: any) => y.web == "on")) {
        this.appAll = true;
      }
      collection.forEach((element: any) => {
        element.email = this.stringToBoolean(element.email);
        element.sms = this.stringToBoolean(element.sms);
        element.web = this.stringToBoolean(element.web);
      });
      this.notifications = collection;
    });
  }

  updateSettings(type: string, eventName: string, $event: any, index: number) {
    this.loading = true;
    this.notificationSettingsUpdate.collection = [];
    let setting: any = {};
    setting['code'] = type;
    setting[eventName] = $event.currentTarget.checked;
    this.notifications[index][eventName] = $event.currentTarget.checked;
    this.notificationSettingsUpdate.collection.push(setting);
    if (this.notifications.some((y: any) => y.email == true)) {
      this.emailAll = true;
    } else {
      this.emailAll = false;
    }
    if (this.notifications.some((y: any) => y.sms == true)) {
      this.smsAll = true;
    } else {
      this.smsAll = false;
    }
    if (this.notifications.some((y: any) => y.web == true)) {
      this.appAll = true;
    } else {
      this.appAll = false;
    }
    this.newgenSvc
      .updateNotificationSettings(this.notificationSettingsUpdate)
      .subscribe(() => {
        this.loading = false;
      },
        err => {
          this.loading = false;
        });
  }

  updateAll(eventName: string) {
    this.loading = true;
    this.notificationSettingsUpdate.collection = [];
    for (let index = 0; index < this.notifications.length; index++) {
      let setting: any = {};
      const element = this.notifications[index];
      setting['code'] = element.type.code;
      if (eventName == 'email') {
        if (!this.emailAll) {
          setting[eventName] = true;
          this.notifications[index][eventName] = true;
        }
        else {
          setting[eventName] = false;
          this.notifications[index][eventName] = false;
        }
        if (this.notifications.length == index + 1) {
          this.emailAll = !this.emailAll
        }
      }
      if (eventName == 'sms') {
        if (!this.smsAll) {
          setting[eventName] = true;
          this.notifications[index][eventName] = true;
        }
        else {
          setting[eventName] = false;
          this.notifications[index][eventName] = false;
        }
        if (this.notifications.length == index + 1) {
          this.smsAll = !this.smsAll
        }
      }
      if (eventName == 'web') {
        if (!this.appAll) {
          setting[eventName] = true;
          this.notifications[index][eventName] = true;
        }
        else {
          setting[eventName] = false;
          this.notifications[index][eventName] = false;
        }
        if (this.notifications.length == index + 1) {
          this.appAll = !this.appAll
        }
      }
      this.notificationSettingsUpdate.collection.push(setting);
    }
    this.newgenSvc
      .updateNotificationSettings(this.notificationSettingsUpdate)
      .subscribe(() => { this.loading = false; },
        err => {
          this.loading = false;
        });
  }

  stringToBoolean(r: string) {
    switch (r.toLowerCase().trim()) {
      case 'true':
      case 'on':
      case '1':
        return true;
      case 'false':
      case 'off':
      case '0':
      case null:
        return false;
      default:
        return r;
    }
  }
}
