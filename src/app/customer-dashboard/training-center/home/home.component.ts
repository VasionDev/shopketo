import { Component, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { TrainingDataService } from 'src/app/shared/services/app-training-data.service';

@Component({
  selector: 'app-training-center-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class TrainingCenterHomeComponent implements OnInit, OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public tenant!: string;
  public facebookId: string = environment.facebookAppId;
  public trainingData: any[] = [];
  public categories: any[] = [];
  public inProgressCategories: any[] = [];
  public completedCategories: any[] = [];
  public notStartedCategories: any[] = [];
  public isSpinner: boolean = false;

  constructor(
    private clipboard: Clipboard,
    private dataService: AppDataService,
    private trainingService: TrainingDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tenant = environment.tenant;
  }

  ngOnInit(): void {
    this.isSpinner = true;
    this.getTrainingCategories();
    window.scrollTo(0, 0);
  }

  getTrainingCategories() {
    this.categories = [];
    this.dataService.trainingCategoryList$
    .pipe(
      takeUntil(this.destroyed$)
    )
    .subscribe((x: any[]) => {
      this.categories = x;
      if(this.categories.length) {
        this.filterCategoriesWithProgressStatus(this.categories)
        this.isSpinner = false;
      }
    })
  }

  onSelectCategory(cat: any) {
    this.router.navigate([cat.catSlug], {relativeTo: this.route})
  }

  filterCategoriesWithProgressStatus(cats: any[]) {
    this.notStartedCategories = [];
    this.inProgressCategories = [];
    this.completedCategories = [];
    cats.map(cat=> {
      if(cat.status === 'on-progress') {
        this.inProgressCategories.push(cat)
      }else if(cat.status === 'completed') {
        const completedCat = this.getCompletedTime(cat)
        cat.completedTime = completedCat.time
        this.completedCategories.push(cat)
      }else {
        this.notStartedCategories.push(cat)
      }
      return cat
    })
  }

  getCompletedTime(cat: any) {
    const localStrgCategory = localStorage.getItem('CompletedCategory')
    const completedCategory = localStrgCategory ? JSON.parse(localStrgCategory) : [];
    return completedCategory.find((x: any) => {
      return x.id === cat.catID
    })
  }

  copy(catSlug: string) {
    let link = this.getShareLink(catSlug);
    this.clipboard.copy(link);
  }

  redirectFacebook(catSlug: string) {
    let link = this.getShareLink(catSlug);
    window.open(
      'https://www.facebook.com/dialog/share?' +
        'app_id=' +
        this.facebookId +
        '&display=popup' +
        '&href=' +
        encodeURIComponent(link) +
        '&redirect_uri=' +
        encodeURIComponent('https://' + window.location.host + '/close.html'),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0'
    );
  }

  redirectTwitter(catSlug: string) {
    let link = this.getShareLink(catSlug);
    window.open(
      'https://twitter.com/intent/tweet'
      + '?url=' + encodeURIComponent(link)
      + '&text=' + encodeURIComponent('I just wanted to share with you PruvIt! Please take a look ;) '),
      'mywin',
      'left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
  }

  getShareLink(catSlug?: string) {
    let sharedLink = '';
    if(catSlug != '') {
      sharedLink = window.location.href + '/' + catSlug
    }else {
      sharedLink = window.location.href;
    }
    return sharedLink;
  }

  onRedo(category: any) {
    if (confirm("Are you sure?")) {
      this.isSpinner = true;
      const localStrgLesson = localStorage.getItem('Lesson')
      const localStrgIndex = localStorage.getItem('Index')
      const localStrgCategory = localStorage.getItem('CompletedCategory')
      const completedCategory = localStrgCategory ? JSON.parse(localStrgCategory) : [];
      const LessonArray = localStrgLesson ? JSON.parse(localStrgLesson) : [];
      const IndexArray = localStrgIndex ? JSON.parse(localStrgIndex) : [];
      const posts = category.posts;
      const removedValue = posts.map((post: any) => {
        return post.learnID
      })

      const removeValFromIndex = this.findPositions(IndexArray, removedValue)
      for (var i = removeValFromIndex.length -1; i >= 0; i--) {
        IndexArray.splice(removeValFromIndex[i] , 1);
        LessonArray.splice(removeValFromIndex[i] , 1);
      }

      const rmvCatIndex = completedCategory.findIndex((cat: any) => {
        return cat.id == category.catID;
      });

      if(rmvCatIndex !== -1) {
        completedCategory.splice(rmvCatIndex , 1);
      }

      localStorage.setItem("CompletedCategory", JSON.stringify(completedCategory));
      this.trainingService.saveLearnData(LessonArray, IndexArray)
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe(
        (res: any) => {
          this.trainingService.updateProgressStatus(this.categories);
          this.isSpinner = false;
        },
        (error => {
          console.log('user save', error)
        }),
        () => {}
      )
      window.scrollTo(0, 0);
    }
  }

  findPositions = (first: number[], second: number[]) => {
    const indicies: number[] = [];
    first.forEach((element, index) => {
      if(second.includes(element)){
        indicies.push(index);
      };
    });
    return indicies;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
