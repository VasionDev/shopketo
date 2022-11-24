import {
  Component, OnInit, ViewChild, ElementRef, EventEmitter,
  OnDestroy,
} from '@angular/core';
import { NewgenApiService } from 'src/app/shared/services/newgen-api.service';
import { Person } from '../models/person';
import { SocialSetting } from '../models/socialSetting';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public initialFacebookProfile!: string;
  public initialInstagramProfile!: string;
  public initialTiktokProfile!: string;
  public loading: boolean = false;
  public imageUrl!: string;
  public image: any;
  public isProfile: boolean = true;

  public facebookProfile: SocialSetting = {
    typeId: 15,
    value: ''
  }
  public instagramProfile: SocialSetting = {
    typeId: 16,
    value: ''
  }
  public tiktokProfile: SocialSetting = {
    typeId: 17,
    value: ''
  }
  public initialPerson!: Person;
  public person: Person = {
    name: '',
    publicEmail: '',
    publicPhoneNumber: '',
    publicPreferredRecognitionName: ''
  }
  @ViewChild('phoneInput', { static: false, read: ElementRef })
  public phoneInp!: ElementRef;
  @ViewChild('emailInput', { static: false, read: ElementRef })
  public emailInp!: ElementRef;
  constructor(private newgenSvc: NewgenApiService) { }

  ngOnInit(): void {
    this.getProfileSettings();
    this.getProfilePersonalSettings();
  }

  save() {
    this.loading = true;
    this.requestDataFromMultipleSources();
  }

  public requestDataFromMultipleSources() {
    let array = []
    if (this.initialFacebookProfile !== this.facebookProfile.value) {
      array.push(this.newgenSvc.socialSettingUpdate(this.facebookProfile))
    }
    if (this.initialInstagramProfile !== this.instagramProfile.value) {
      array.push(this.newgenSvc.socialSettingUpdate(this.instagramProfile))
    }
    if (this.initialTiktokProfile !== this.tiktokProfile.value) {
      array.push(this.newgenSvc.socialSettingUpdate(this.tiktokProfile))
    }
    if (JSON.stringify(this.initialPerson) !== JSON.stringify(this.person)) {
      array.push(this.newgenSvc.personProfileUpdate(this.person))
    }
    if (this.image) {
      const formData = new FormData();
      formData.append("file", this.image);
      array.push(this.newgenSvc.uploadProfileImage(formData));
    }
    if (array.length == 0) {
      this.loading = false;
    }
    forkJoin(array).subscribe(x => {
      if (this.image) {
        let image = x.find(x => x.content)
        this.agentUpdate(image.content)
      }
      this.loading = false;
    });
  }

  getProfileSettings() {
    this.newgenSvc.getProfileSettings().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.facebookProfile = x.collection.find((y: any) => this.facebookProfile.typeId == y.typeId)
      this.instagramProfile = x.collection.find((y: any) => this.instagramProfile.typeId == y.typeId)
      this.tiktokProfile = x.collection.find((y: any) => this.tiktokProfile.typeId == y.typeId)
      this.initialFacebookProfile = this.facebookProfile.value;
      this.initialInstagramProfile = this.instagramProfile.value;
      this.initialTiktokProfile = this.tiktokProfile.value;
    })
  }

  getProfilePersonalSettings() {
    this.newgenSvc.getProfilePersonalSettings().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.person.name = x.collection[0].name || '';
      this.person.publicEmail = x.collection[0].publicEmail || '';
      this.person.publicPhoneNumber = x.collection[0].publicPhoneNumber || '';
      this.person.publicPreferredRecognitionName = x.collection[0].publicPreferredRecognitionName || '';
      this.imageUrl = x.collection[0].imageUrl;
      this.initialPerson = { ...this.person };
    })
  }

  personProfileUpdate() {
    this.newgenSvc.personProfileUpdate(this.person).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.loading = false;
    })
  }

  socialSettingUpdate(setting: SocialSetting) {
    this.newgenSvc.socialSettingUpdate(setting).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.loading = false;
    })
  }

  fileChangeListener($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      let fileSize = $event.target.files[0].size / 1024 / 1024;
      if (fileSize > 10) {
        return;
      }
      if (
        $event.target.files[0].type == "image/png" ||
        $event.target.files[0].type == "image/jpeg"
      ) {
        let reader = new FileReader();
        reader.onload = (event: any) => {

          this.image = $event.target.files[0];
          this.imageUrl = <string>reader.result;
        };
        reader.readAsDataURL($event.target.files[0]);

      } else {
        return;
      }
    }
  }
  uploadImage() {
    const formData = new FormData();
    formData.append("file", this.image);
    this.newgenSvc.uploadProfileImage(formData).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x.isSuccess) {
        this.agentUpdate(x.content)
      }
    })
  }

  agentUpdate(imageString: string) {
    this.newgenSvc.agentUpdate(imageString).pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.image = null;
    })
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
