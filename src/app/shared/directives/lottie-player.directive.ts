import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[appLottiePlayer]',
})
export class LottiePlayerDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.animateIcons();
  }

  @HostListener('mouseenter', ['$event'])
  pauseLottieAnimation(event: any) {
    let isAnimationStarted = false;

    if (!isAnimationStarted) {
      const player: any = event.target.querySelector('lottie-player');

      isAnimationStarted = true;
      player.stop();
      player.play();

      player.addEventListener('complete', () => {
        isAnimationStarted = false;
      });
    }
  }

  animateIcons() {
    this.observer = new IntersectionObserver(
      (entries) => {
        let isAnimationStarted = false;

        if (entries[0].isIntersecting === true) {
          if (!isAnimationStarted) {
            const playerList =
              this.el.nativeElement.querySelectorAll('lottie-player');

            playerList.forEach((player: any) => {
              isAnimationStarted = true;
              player.stop();
              player.play();

              player.addEventListener('complete', () => {
                isAnimationStarted = false;
              });
            });
          }
        }
      },
      { threshold: [0.5] }
    );

    this.observer.observe(this.el.nativeElement.querySelector('lottie-player'));
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
