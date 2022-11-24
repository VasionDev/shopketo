import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SearchBlogPipe } from 'src/app/shared/pipes/search-blog.pipe';
import { SearchPipe } from 'src/app/shared/pipes/search.pipe';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SearchBaseComponent } from '../search-base/search-base.component';

@Component({
  selector: 'app-search-desktop',
  templateUrl: './search-desktop.component.html',
  styleUrls: ['./search-desktop.component.css'],
  providers: [SearchPipe, SearchBlogPipe],
})
export class SearchDesktopComponent
  extends SearchBaseComponent
  implements OnInit
{
  @Output() inputFocusEvent = new EventEmitter<boolean>(false);
  @ViewChild('searchInput') searchInput!: ElementRef;
  isInputFocused = false;
  searchFilter = this.dataService.searchKey;
  listIndex = -1;

  constructor(
    utilityService: AppUtilityService,
    dataService: AppDataService,
    router: Router,
    renderer: Renderer2,
    private translate: TranslateService,
    private searchPipe: SearchPipe,
    private searchBlogPipe: SearchBlogPipe
  ) {
    super(dataService, renderer, utilityService, router);
  }

  ngOnInit(): void {
    this.getBodyClassStatus();
  }

  getBodyClassStatus() {
    this.dataService.isSearchFocused$.subscribe((status) => {
      this.isInputFocused = status;

      this.inputFocusEvent.emit(status);

      if (status) {
        setTimeout(() => {
          if (this.searchInput) {
            this.searchInput.nativeElement.focus();
          }
        }, 0);
      }
    });
  }

  onSearch() {
    this.isInputFocused = true;

    this.inputFocusEvent.emit(true);

    this.renderer.addClass(document.body, 'search-focus');
  }

  onInput() {
    this.isInputFocused = true;

    this.inputFocusEvent.emit(true);

    this.renderer.addClass(document.body, 'search-focus');
  }

  onBlur() {
    if (this.searchInput) {
      this.searchInput.nativeElement.placeholder =
        this.translate.instant('search-pruvit');
    }
  }

  override onClickBlog(blogSlug: string) {
    super.onClickBlog(blogSlug);

    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
  }

  override onClickSeeResults() {
    this.dataService.searchKey = this.searchFilter;

    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }

    super.onClickSeeResults();
  }

  override onClickProduct(postName: string) {
    super.onClickProduct(postName);

    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeySlashHandler(event: any) {
    if (this.isInputFocused) {
      let filteredProducts = this.searchPipe.transform(
        this.products,
        this.searchFilter,
        'search-modal'
      );
      let filteredBlogs: any[] = this.searchBlogPipe.transform(
        this.blogs,
        this.searchFilter
      );
      const productsSplitedLength =
        filteredProducts.length > 4 ? 5 : filteredProducts.length;
      const blogsSplitedLength =
        filteredBlogs.length > 4 ? 4 : filteredBlogs.length;

      if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
        if (this.listIndex > -1) {
          this.listIndex--;
        }
      }
      if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
        if (this.listIndex < productsSplitedLength + blogsSplitedLength + 5) {
          this.listIndex++;
        }
      }

      const quickIndex = productsSplitedLength + blogsSplitedLength;

      if (event.code === 'Enter') {
        if (this.listIndex === quickIndex + 0) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052368331-COVID-Notice';
        }
        if (this.listIndex === quickIndex + 1) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052059231-Update-SmartShip-auto-ship-Date';
        }
        if (this.listIndex === quickIndex + 2) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360052058131-Update-My-Personal-Information';
        }
        if (this.listIndex === quickIndex + 3) {
          window.location.href =
            'https://support.justpruvit.com/hc/en-us/articles/360045633072-Pr%C3%BCvit-Product-Guide';
        }
        if (this.listIndex === quickIndex + 4) {
          window.location.href = 'https://support.justpruvit.com/';
        }

        if (this.listIndex > -1) {
          if (this.listIndex < productsSplitedLength) {
            if (filteredProducts.length > 0) {
              if (this.listIndex === 4) {
                this.onClickSeeResults();
              } else {
                const activatedProduct = filteredProducts.find(
                  (x, i: number) => i === this.listIndex
                );
                if (activatedProduct) {
                  this.onClickProduct(activatedProduct.name);
                }
              }
            }
          } else {
            if (filteredBlogs.length > 0) {
              const activatedBlog = filteredBlogs.find(
                (x: any, i: number) =>
                  i + productsSplitedLength === this.listIndex
              );
              if (activatedBlog) {
                this.onClickBlog(activatedBlog.slug);
              }
            }
          }
        } else {
          if (filteredProducts.length === 1) {
            this.onClickProduct(filteredProducts[0].name);
          } else if (filteredBlogs.length === 1) {
            this.onClickBlog(filteredBlogs[0].slug);
          } else {
            this.onClickSeeResults();
          }
        }
      }
    }
    if (event.code === 'Escape') {
      this.renderer.removeClass(document.body, 'search-focus');
      this.dataService.changeSearchFocusStatus(false);

      if (this.searchInput) {
        this.searchInput.nativeElement.blur();
      }
    }
  }
}
