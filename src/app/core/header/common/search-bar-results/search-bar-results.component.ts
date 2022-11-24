import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Blog } from 'src/app/blogs/models/blog.model';
import { Product } from 'src/app/products/models/product.model';

@Component({
  selector: 'app-search-bar-results',
  templateUrl: './search-bar-results.component.html',
  styleUrls: ['./search-bar-results.component.css'],
})
export class SearchBarResultsComponent {
  @Output() productSlugEvent = new EventEmitter<string>();
  @Output() seeResultsEvent = new EventEmitter<boolean>(false);
  @Output() blogEvent = new EventEmitter<string>();

  @Input() products: Product[] = [];
  @Input() blogs: Blog[] = [];
  @Input() searchFilter = '';
  @Input() listIndex = -1;

  setQuickLinkActiveClass(
    itemIndex: number,
    productsLength: number,
    blogsLength: number
  ) {
    const productsSplitedLength = productsLength > 4 ? 5 : productsLength;
    const blogsSplitedLength = blogsLength > 4 ? 4 : blogsLength;

    return itemIndex + productsSplitedLength + blogsSplitedLength;
  }

  setBlogActiveClass(itemIndex: number, productsLength: number) {
    const productsSplitedLength = productsLength > 4 ? 5 : productsLength;

    return itemIndex + productsSplitedLength;
  }

  onClickProduct(postName: string) {
    this.productSlugEvent.emit(postName);
  }

  onClickSeeResults() {
    this.seeResultsEvent.emit(true);
  }

  onClickBlog(blogSlug: string) {
    this.blogEvent.emit(blogSlug);
  }
}
