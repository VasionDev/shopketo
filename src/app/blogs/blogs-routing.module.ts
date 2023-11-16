import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogsComponent } from './blogs.component';
import { BlogAuthorsComponent } from './components/blog-authors/blog-authors.component';
import { BlogCategoriesComponent } from './components/blog-categories/blog-categories.component';
import { BlogDetailsComponent } from './components/blog-details/blog-details.component';
import { BlogsHomeComponent } from './components/blogs-home/blogs-home.component';

const routes: Routes = [
  {
    path: '',
    component: BlogsComponent,
    children: [
      { path: '', component: BlogsHomeComponent },
      { path: 'category/:id', component: BlogCategoriesComponent },
      { path: 'author/:id', component: BlogAuthorsComponent },
      { path: ':id', component: BlogDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogsRoutingModule {}
