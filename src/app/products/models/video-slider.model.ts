import { Observable } from 'rxjs';

export interface VideoSlider {
  src: string;
  thumbnail$: Observable<string>;
  type: 'WISTIA' | 'PRUVIT_TV';
}
