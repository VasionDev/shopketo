import { ElementRef } from '@angular/core';
import { LottiePlayerDirective } from './lottie-player.directive';

describe('LottiePlayerDirective', () => {
  let el: ElementRef;
  it('should create an instance', () => {
    const directive = new LottiePlayerDirective(el);
    expect(directive).toBeTruthy();
  });
});
