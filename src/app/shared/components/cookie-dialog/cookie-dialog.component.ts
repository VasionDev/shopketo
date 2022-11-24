import { Component, Input } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-cookie-dialog',
  templateUrl: './cookie-dialog.component.html',
  styleUrls: ['./cookie-dialog.component.css'],
})
export class CookieDialogComponent {
  @Input() show = false;

  constructor(private dataService: AppDataService) {}

  onEditPreference() {
    this.show = false;
    this.dataService.setCookieDialogStatus(false);

    this.dataService.changePostName({ postName: 'cookie-modal' });
    $('#cookieModal').modal({ backdrop: 'static', keyboard: false });
  }

  onDismiss() {
    this.show = false;
  }
}
