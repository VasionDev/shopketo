import { Component, Input } from '@angular/core';
import { VideoSlider } from 'src/app/products/models/video-slider.model';

@Component({
  selector: 'app-video-slider',
  templateUrl: './video-slider.component.html',
  styleUrls: ['./video-slider.component.css'],
})
export class VideoSliderComponent {
  @Input()
  videoSlides: VideoSlider[] = [];
}
