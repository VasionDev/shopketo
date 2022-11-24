import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../services/app-data.service';

declare var $: any;
@Component({
  selector: 'app-modal-restrict-share-cart',
  templateUrl: './modal-restrict-share-cart.component.html',
  styleUrls: ['./modal-restrict-share-cart.component.css']
})
export class ModalRestrictShareCartComponent implements OnInit {

  constructor(
    private dataService: AppDataService
  ) { }

  ngOnInit(): void {
  }

  onContinueSharing() {
    this.dataService.changePostName({
      postName: 'pruvit-modal-utilities',
    });
    $('#shareCartModal').modal('show');
  }

}
