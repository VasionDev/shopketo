import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { TrainingDataService } from 'src/app/shared/services/app-training-data.service';

@Component({
  selector: 'app-training-center',
  templateUrl: './training-center.component.html',
  styleUrls: ['./training-center.component.css']
})
export class TrainingCenterComponent implements OnInit, OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public trainingData: any[] = [];
  public categories: any[] = [];

  constructor(
    private apiService: AppApiService,
    private dataService: AppDataService,
    private trainingDataService: TrainingDataService
  ) {}

  ngOnInit(): void {
    this.dataService.setTrainingCategoryList([])
    this.dataService.setCurrentTrainingCategory({})
    this.subscribeTrainingData();
  }

  subscribeTrainingData() {
    this.categories = [];

    this.trainingDataService.getUserDataFromServer()
    .pipe(
      takeUntil(this.destroyed$),
      switchMap((res: any) => {
        return this.apiService.getTrainingCenterData()
        .pipe(
          tap(()=> {
            if(res.isSuccess) {
              const data = JSON.parse(res.data);
              localStorage.setItem("Index", JSON.stringify(data.indexArray));
              localStorage.setItem("Lesson", JSON.stringify(data.lessonArray));
              localStorage.setItem("CompletedCategory", JSON.stringify(data.completedCategory));
            }else {
              localStorage.setItem("Index", JSON.stringify([]));
              localStorage.setItem("Lesson", JSON.stringify([]));
              localStorage.setItem("CompletedCategory", JSON.stringify([]));
            }
          })
        );
      })
    )
    .subscribe((x: [])=> {
      this.trainingData = x;
      this.dataService.setTrainingData(x);
      const categoryData = this.trainingDataService.getMappedTrainingData(this.trainingData)
      this.trainingDataService.updateProgressStatus(categoryData);
    })
  }

  setCategoryStatus(cats: any[]) {
    return cats.map(cat=> {
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

  cleaningLocalStorage() {
    localStorage.removeItem('Index');
    localStorage.removeItem('Lesson');
    localStorage.removeItem('CompletedCategory');
    localStorage.removeItem('CompletedTools');
    localStorage.removeItem('LastLesson');
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.cleaningLocalStorage();
  }

}
