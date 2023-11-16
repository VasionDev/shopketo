import { Injectable } from '@angular/core';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { AppUserService } from './app-user.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TrainingDataService {

  user: any = null

  constructor(
      private productsUtilityService: ProductsUtilityService,
      private userService: AppUserService,
      private dataService: AppDataService,
      private apiService: AppApiService
  ) {
    this.dataService.currentUserWithScopes$.subscribe((user) => {
      if (user !== null) {
        this.user = user;
      }
    });
  }

  getMappedTrainingData(trainingData: any[]) {
    const categories: any[] = []
    trainingData.forEach((post: any) => {
      post.accessLevels = 
          this.productsUtilityService.getAccessLevels(post.hasOwnProperty('availability_for') ? post.availability_for : '');
      post.customUsers = 
          post.hasOwnProperty('mvp_custom_users_list') ? post.mvp_custom_users_list?.map((user: string) => +user[0]) : [];
      post.isUserCanAccess = this.userService.checkUserAccess(post.accessLevels, post.customUsers);
      post.accessLevelTitle = this.userService.accessLevelTitle(post.accessLevels);
      if (post.hasOwnProperty("category")) {
        post.category.forEach((category: any) => {
          if (!categories.some((item) => item.catSlug === category.slug)) {
            const accessLevels = 
                this.productsUtilityService.getAccessLevels(category.hasOwnProperty('availability_for') ? category.availability_for : '');
            const customUsers = category.hasOwnProperty('mvp_custom_users_list') ? category.mvp_custom_users_list?.map((user: string) => +user[0]) : []
            categories.push({
              catID: category.id,
              catName: category.name,
              catSlug: category.slug,
              catColor1: category.bg_color_1,
              catColor2: category.bg_color_2,
              catImage: category.image,
              availabilityFor: category.availability_for,
              accessLevels: this.productsUtilityService.getAccessLevels(
                category.hasOwnProperty('availability_for') ? category.availability_for : ''
              ),
              customUsers: category.hasOwnProperty('mvp_custom_users_list')
              ? category.mvp_custom_users_list?.map((user: string) => +user[0]) : [],
              isUserCanAccess: this.userService.checkUserAccess(accessLevels, customUsers),
              accessLevelTitle: this.userService.accessLevelTitle(accessLevels),
            });
          }
        });
      }
    });
    const activeCategories = categories.filter(cat=> !cat.accessLevels.isHidden.on)
    return this.getCategoriesWithPosts(trainingData, activeCategories)
  }

  private getCategoriesWithPosts(trainingData: any [], categories: any[]) {
    const catData = [...categories]
    const data = [...trainingData]
    const categoriesWithPosts: any[] = [];
    catData.forEach((mainCategory: any) => {
      const tempPosts: any[] = [];
      data.forEach((post: any) => {
          if (post.hasOwnProperty("category")) {
            post.category.forEach((category: any) => {
              if (category.slug === mainCategory.catSlug) {
                tempPosts.push(post);
              }
            });
          }
      });
      categoriesWithPosts.push({
        category: mainCategory.catSlug,
        posts: tempPosts,
      });
    });
    catData.forEach((category) => {
      categoriesWithPosts.forEach((tempCategory) => {
        if (tempCategory.category === category.catSlug) {
          category.posts = tempCategory.posts;
        }
      });
    });
    return [...catData]
  }

  updateProgressStatus(cats: any[]) {
    const updatedPosts = cats.map(cat=> {
      const percentage = this.getCompletePercentage(cat.posts)
      if(percentage > 0 && percentage < 100) {
        cat.status = 'on-progress';
        cat.completion_percentage = percentage
      }else if(percentage == 100) {
        cat.status = 'completed';
        cat.completion_percentage = percentage
      }else {
        cat.status = 'not-started';
        cat.completion_percentage = percentage
      }
      return cat
    })
    this.dataService.setTrainingCategoryList(updatedPosts)
    return updatedPosts;
  }
    
  getCompletePercentage(posts: any[]) {
    let allLength = posts.length;
    let totalLesson = 0;
    let completePercent = "";
    let intersectionLessonID = [];
    let localStrgLesson = localStorage.getItem('Lesson')
    let completedLessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    const currentAllLessonID: any[] = [];
  
    while (allLength > 0) {
      totalLesson = totalLesson + posts[--allLength].lesson.length;
    }
    posts.forEach((post) => {
      post.lesson.forEach((element: any) => {
        if (!currentAllLessonID.includes(element.lesson_id)) {
          currentAllLessonID.push(element.lesson_id);
        }
      });
    });
    intersectionLessonID = completedLessonArray.filter((value: any) =>
      currentAllLessonID.includes(value)
    );
    completedLessonArray = intersectionLessonID;
    if (completedLessonArray !== null) {
      completePercent = (
        (100 * completedLessonArray.length) /
        totalLesson
      ).toFixed();
    } else {
      completedLessonArray = [];
    }
    return +completePercent;
  }

  saveLearnData(lessonArray: any[], indexArray: any[]) {
    localStorage.setItem("Lesson", JSON.stringify(lessonArray));
    localStorage.setItem("Index", JSON.stringify(indexArray));
    return this.sendDataToServer()
  }

  private sendDataToServer() {
    const localStrgLesson = localStorage.getItem('Lesson');
    const localStrgIndex = localStorage.getItem('Index');
    const localStrgCategory = localStorage.getItem('CompletedCategory');
    const LessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    const IndexArray = localStrgIndex ? JSON.parse(localStrgIndex) : [];
    const completedCategory = localStrgCategory ? JSON.parse(localStrgCategory) : [];
    if(this.user) {
      const userId = this.user.mvuser_id;
      return this.apiService.saveUserTrainingData(userId, IndexArray, LessonArray, completedCategory)
    }
    return of({isSuccess: false})
  }

  getUserDataFromServer() {
    if(this.user) {
      const userId = this.user.mvuser_id;
      return this.apiService.getUserTrainingData(userId)
    }
    return of({isSuccess: false})
  }
}
