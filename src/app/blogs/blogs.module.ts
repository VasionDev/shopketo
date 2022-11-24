import { NgModule } from '@angular/core';
import { BlogDetailsComponent } from './components/blog-details/blog-details.component';
import { BlogsHomeComponent } from './components/blogs-home/blogs-home.component';
import { BlogsRoutingModule } from './blogs-routing.module';
import { BlogsComponent } from './blogs.component';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import * as fromBlogs from './store/blogs.reducer';
import { TextTruncatePipe } from './pipes/text-truncate.pipe';
import { BlogCategoriesComponent } from './components/blog-categories/blog-categories.component';
import { BlogAuthorsComponent } from './components/blog-authors/blog-authors.component';
import { BlogCategorySearchPipe } from './pipes/blog-category-search.pipe';

@NgModule({
  declarations: [
    BlogDetailsComponent,
    BlogsHomeComponent,
    BlogsComponent,
    TextTruncatePipe,
    BlogCategoriesComponent,
    BlogAuthorsComponent,
    BlogCategorySearchPipe,
  ],
  imports: [
    BlogsRoutingModule,
    SharedModule,
    StoreModule.forFeature('blogs', fromBlogs.BlogsReducer),
  ],
  providers: [],
})
export class BlogsModule {}
