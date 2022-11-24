import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Blog } from 'src/app/blogs/models/blog.model';

@Injectable()
export class FoodApiServiceStub {
  setNextRunDate(
    autoshipId: number,
    tokenType: string,
    accessToken: string,
    nextRun: string
  ) {
    return of();
  }
}
