import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SearchBaseComponent } from '../search-base/search-base.component';

@Component({
  selector: 'app-search-mobile',
  templateUrl: './search-mobile.component.html',
  styleUrls: ['./search-mobile.component.css'],
})
export class SearchMobileComponent
  extends SearchBaseComponent
  implements OnInit
{
  @ViewChild('searchInputMobile') searchInputMobile!: ElementRef;
  searchFilter = this.dataService.searchKey;
  isMobileSearchFocused = false;

  constructor(
    dataService: AppDataService,
    renderer: Renderer2,
    utilityService: AppUtilityService,
    router: Router,
    private translate: TranslateService
  ) {
    super(dataService, renderer, utilityService, router);
  }

  ngOnInit(): void {
    this.getBodyClassStatus();
  }

  getBodyClassStatus() {
    this.dataService.isSearchFocused$.subscribe((status) => {
      this.isMobileSearchFocused = status;

      if (status) {
        setTimeout(() => {
          if (this.searchInputMobile) {
            this.searchInputMobile.nativeElement.focus();
          }
        }, 0);
      }
    });
  }

  onBlur() {
    if (this.searchInputMobile) {
      this.searchInputMobile.nativeElement.placeholder =
        this.translate.instant('search-pruvit');
    }
  }

  onInput() {
    this.renderer.addClass(document.body, 'search-focus');
  }

  override onClickSeeResults() {
    this.dataService.searchKey = this.searchFilter;

    super.onClickSeeResults();
  }

  override onClickBlog(blogSlug: string) {
    super.onClickBlog(blogSlug);
  }

  override onClickProduct(postName: string) {
    super.onClickProduct(postName);
  }
}
