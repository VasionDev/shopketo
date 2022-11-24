import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { Food } from '../../models/food.model';
import { selectFoods } from '../../store/foods-list.selectors';
declare var $: any;
declare var foodLandSlide: any;
declare var loadTypeText: any;
declare var foodLandTestimonial: any;

@Component({
  selector: 'app-foods-home',
  templateUrl: './foods-home.component.html',
  styleUrls: ['./foods-home.component.css'],
})
export class FoodsHomeComponent implements OnInit, OnDestroy {
  foods: Food[] = [];
  language = '';
  discountHeight = 0;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private titleService: Title,
    private metaService: Meta,
    private store: Store<AppState>
  ) {
    $(document).on('hidden.bs.modal', '#foodDetailsModal', () => {
      $('.modal-backdrop').remove();
    });
  }

  ngOnInit(): void {
    this.setSeo();
    this.getLanguage();
    this.getDiscountHeight();
    this.getFoods();
  }

  getLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage$.subscribe(
        (language: string) => {
          this.language = language;
        }
      )
    );
  }

  getDiscountHeight() {
    this.dataService.currentDiscountHeight$.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select(selectFoods).subscribe((foods) => {
        this.foods = foods;

        if (this.foods.length > 0) {
          setTimeout(() => {
            foodLandSlide();
          }, 0);
        }

        $(document).ready(() => {
          loadTypeText();
          foodLandTestimonial();
        });
      })
    );
  }

  checkZipCode() {
    this.dataService.changePostName({ postName: 'zip-modal' });
    $('#userZipModal').modal('show');
  }

  setSeo() {
    this.titleService.setTitle(
      'Prüvit Food | Better Meals and Snacks. Now Delivered.'
    );
    this.metaService.updateTag({
      name: 'description',
      content:
        'Healthy, delicious, Prüvit approved meals made with farm-fresh ingredients, ready in 5 minutes or less.',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: 'assets/images/food-site-image.jpeg',
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
