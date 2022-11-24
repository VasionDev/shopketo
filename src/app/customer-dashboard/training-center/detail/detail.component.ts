import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { TrainingDataService } from 'src/app/shared/services/app-training-data.service';
declare var $: any;

@Component({
  selector: 'app-training-center-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class TrainingCenterDetailComponent implements OnInit, OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  category: any = null;
  categories: any[] = [];
  lesson: any = {};
  post: any = {};
  nextLesson: any = null;
  nextPost: any = null;
  modalSpinner: boolean = false;
  incompleteLesson: any[] = [];
  expandIndex: number = 0;
  prerequisitesPosts: any[] = [];
  resources: any[] = [];
  prerequisiteModalTitle: string = '';

  constructor(
    private dataService: AppDataService,
    private trainingDataService: TrainingDataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const categorySlug = this.route.snapshot.paramMap.get('slug');
    this.dataService.trainingCategoryList$
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe((categories: any[]) => {
      this.categories = categories;
      const data = categories.find(x =>  x.catSlug === categorySlug)
      this.category = data ? data : null;
      this.dataService.setCurrentTrainingCategory(this.category);
      // console.log(this.category)
      if(this.category) {
        this.getNextStartLesson()
        this.allComplete()
      }
    })
    window.scrollTo(0, 0);
  }

  lessonDetails(post: any, lesson: any) {
    this.post = post
    this.lesson = lesson
    this.hideAndShowModal('#incompletedLessonModal', '#lessonDetailModal')
  }

  private hideAndShowModal(hideModalId: string, showModalId: string) {
    $(hideModalId).modal('hide')
    $(showModalId).modal('show')
    $(showModalId).on('shown.bs.modal', function () {
      if($('.modal.show').length > 0){
          $('body').addClass('modal-open');
      }
    });
  }

  isCompleted(i: any, l: any) {
    const localStrgLesson = localStorage.getItem('Lesson')
    const localStrgIndex = localStorage.getItem('Index')
    const LessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    const IndexArray = localStrgIndex ? JSON.parse(localStrgIndex) : [];

    const indexes = [];
    let indexOfArray: number;
    for (
      indexOfArray = 0;
      indexOfArray < IndexArray.length;
      indexOfArray++
    ) {
      if (IndexArray[indexOfArray] === i) {
        indexes.push(indexOfArray);
      }
    }
    let newIndex: number;
    for (newIndex = 0; newIndex < indexes.length; newIndex++) {
      if (LessonArray[indexes[newIndex]] === l) {
        return true;
      }
    }
    return false;
  }

  getNextStartLesson() {
    this.nextLesson = null
    this.nextPost = null
    const localStrgLesson = localStorage.getItem('Lesson')
    const LessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    for (let mainIndex = 0; mainIndex < this.category.posts.length; mainIndex++) {
      const post = this.category.posts[mainIndex];
      for (const lesson of post.lesson) {
        if (!LessonArray.includes(lesson.lesson_id)) {
          this.nextLesson = lesson
          this.nextPost = post;
          this.expandIndex = mainIndex;
          break;
        }
      }
      if(this.nextLesson && this.nextPost) {
        break;
      }
    }
  }

  getCompletedLessonNumber(post: any): number {
    const localStrgLesson = localStorage.getItem('Lesson')
    const LessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    let lessonNo = 0;

    for (const lesson of post.lesson) {
      if (LessonArray.includes(lesson.lesson_id)) {
        lessonNo++;
      }
    }
    return lessonNo;
  }

  onNextLesson() {
    this.modalSpinner = true;
    this.saveCompletedLesson(this.post.learnID, this.lesson.lesson_id);
  }

  saveCompletedLesson(completedIndex: any, completedLesson: any) {
    const nextLessonId = this.lesson.next_lesson ? this.lesson.next_lesson.lesson_id : null;
    const localStrgLesson = localStorage.getItem('Lesson')
    const localStrgIndex = localStorage.getItem('Index')
    const LessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    const IndexArray = localStrgIndex ? JSON.parse(localStrgIndex) : [];

    if (!LessonArray.includes(completedLesson)) {
      localStorage.setItem("LastLesson", JSON.stringify(completedIndex));
      IndexArray.push(completedIndex);
      LessonArray.push(completedLesson);
    }

    this.trainingDataService.saveLearnData(LessonArray, IndexArray)
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe(
      (res: any)=> {
        // console.log('save api response', res)
        this.trainingDataService.updateProgressStatus(this.categories);
        if(nextLessonId !== null) {
          if(LessonArray.includes(nextLessonId)) {
            for (const lesson of this.post.lesson) {
              if (!LessonArray.includes(lesson.lesson_id)) {
                this.lesson = lesson
                this.nextLesson = lesson
                break;
              }
            }
          }else {
            this.lesson = this.post.lesson.find((x:any) =>  x.lesson_id === nextLessonId)
            this.nextLesson = this.lesson
          }
        }else {
          this.getNextStartLesson()
        }
        this.modalSpinner = false
      },
      (error => {
        console.log('user save', error)
      }),
      () => {
        // console.log('completed')
      }
    )
  }

  onCompleteLesson() {
    this.incompleteLesson = []
    const localStrgLesson = localStorage.getItem('Lesson')
    const completeLesson = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    const localCompletedTools = localStorage.getItem("CompletedTools");
    const CompletedTools = localCompletedTools ? JSON.parse(localCompletedTools) : [];
    const lessonLists = this.post.lesson;
    for (let i = 0; i < lessonLists.length - 1; i++) {
      if (!completeLesson.includes(lessonLists[i].lesson_id)) {
        this.incompleteLesson.push(lessonLists[i]);
      }
    }

    if (!this.incompleteLesson.length) {
      const postCount = this.category.posts.length;
      const completedCount = CompletedTools.length;
      if(postCount === (completedCount + 1)) {
        const localStrgCategory = localStorage.getItem('CompletedCategory')
        const completedCategory = localStrgCategory ? JSON.parse(localStrgCategory) : [];
        const isFind  = completedCategory.find((cat: any) => {
          return cat.id == this.category.catID
        })
        if(!isFind) {
          let data = {id: this.category.catID, time: new Date().toLocaleString('en-us', {
            timeZone: 'CST',
            weekday:"short",
            month:"short", 
            day:"numeric", 
            hour: 'numeric',
            timeZoneName: 'short'
          })}
          completedCategory.push(data)
          localStorage.setItem("CompletedCategory", JSON.stringify(completedCategory));
        }
        // console.log('completed category', this.category)
      }

      this.saveCompletedLesson(this.post.learnID, this.lesson.lesson_id)
      this.allComplete();
      this.hideAndShowModal('#lessonDetailModal', '#congratulationsModal')
    }else {
      this.hideAndShowModal('#lessonDetailModal', '#incompletedLessonModal')
    }
  }

  onTrainingCenterHome(){
    $('#congratulationsModal').modal('hide')
    this.router.navigate(['/dashboard/training-center'])
  }

  onNextModule() {
    if(this.nextLesson) {
      this.lesson = this.nextLesson
      this.post = this.nextPost
      this.hideAndShowModal('#congratulationsModal', '#lessonDetailModal')
    }else {
      this.onTrainingCenterHome()
    }
  }

  allComplete() {
    // const localCompletedTools = localStorage.getItem("CompletedTools");
    // const CompletedTools = localCompletedTools ? JSON.parse(localCompletedTools) : [];
    const CompletedTools = [];
    const localStrgLesson = localStorage.getItem('Lesson')
    const completeLesson = localStrgLesson ? JSON.parse(localStrgLesson) : [];
    let n: number;
    let trueCount = 0;
    if (this.category.posts) {
      const posts = this.category.posts
      for (n = 0; n < posts.length; n++) {
        const lessons = posts[n].lesson;
        lessons.forEach((element: any) => {
          if (completeLesson.length) {
            if (completeLesson.includes(element.lesson_id)) {
              trueCount++;
            }
          }
        });
        if (posts[n].lesson.length === trueCount) {
          if (CompletedTools.indexOf(posts[n].learnID) === -1) {
            CompletedTools.push(posts[n].learnID);
          }
        } else {
          const index = CompletedTools.indexOf(posts[n].learnID);
          if (index > -1) {
            CompletedTools.splice(index, 1);
          }
        }
        trueCount = 0;
      }
    }
    localStorage.setItem("CompletedTools", JSON.stringify(CompletedTools));
  }

  prerequisiteModuleList(postTitle: string, prerequisitesIds: any[]) {
    this.prerequisiteModalTitle = postTitle;
    this.prerequisitesPosts = [];
    if (this.category.posts) {
      const posts = this.category.posts
      for (let i = 0; i < posts.length; i++) {
        if(prerequisitesIds.indexOf(posts[i].learnID) !== -1){
          const mdPost = {...posts[i], index: i}
          this.prerequisitesPosts.push(mdPost)
        }
      }
    }
    $('#lockedModuleModal').modal('show')
  }

  onExpandModule(expandIndex: any) {
    $(`#collapse-${this.expandIndex + '-lesson'}`).collapse('show')
    $('#lockedModuleModal').modal('hide')
  }

  isPrerequisiteComplete(post: any) {
    const localCompletedTools = localStorage.getItem("CompletedTools");
    const CompletedTools = localCompletedTools ? JSON.parse(localCompletedTools) : [];
    let arr1: any[] = [];
    let arr2: any[] = [];

    const posts = this.category.posts
    for (let k = 0; k < posts.length; k++) {
      if (posts[k].learnID === post.learnID) {
        const prerequisites = posts[k].prerequisites;
        const result = [];
        for (let i = 0, l = prerequisites.length; i < l; i++) {
          result.push(+prerequisites[i]);
        }
        arr1 = result.concat().sort();
        arr2 = CompletedTools.concat().sort();
        break
      }
    }
    if (arr1.length !== 0) {
      if (arr1.every((val: any) => arr2.includes(val))) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }

  }

  onResourceModal(resources: any[], event: any) {
    event.stopPropagation();
    this.resources = resources ? resources : []
    $('#resourcesModal').modal('show')
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
