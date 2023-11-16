import { Component, Input, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';
declare var $: any;

@Component({
  selector: 'app-cookie-dialog',
  templateUrl: './cookie-dialog.component.html',
  styleUrls: ['./cookie-dialog.component.css'],
})
export class CookieDialogComponent implements OnInit {
  @Input() show = false;

  constructor(private dataService: AppDataService) {}

  ngOnInit(): void {
    $(document).ready(() => {
      $('body').on('hidden.bs.modal', '#cookieModal', function () {
        if ($('.modal-backdrop').length) $('.modal-backdrop').remove();
      });
    });
  }

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
