import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlogsHomeComponent } from './components/blogs-home/blogs-home.component';
import { BlogDetailsComponent } from './components/blog-details/blog-details.component';
import { BlogsComponent } from './blogs.component';
import { BlogCategoriesComponent } from './components/blog-categories/blog-categories.component';
import { BlogAuthorsComponent } from './components/blog-authors/blog-authors.component';

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
