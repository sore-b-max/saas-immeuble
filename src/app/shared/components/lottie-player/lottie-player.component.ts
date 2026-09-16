import { Component, ElementRef, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-lottie-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #container 
      [style.width]="width" 
      [style.height]="height" 
      class="lottie-container relative flex items-center justify-center overflow-hidden"
      [class.cursor-pointer]="playOnHover"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()">
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .lottie-container svg {
      width: 100% !important;
      height: 100% !important;
      transform: translate3d(0, 0, 0);
    }
  `]
})
export class LottiePlayerComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  @Input() path?: string;
  @Input() animationData?: any;
  @Input() loop: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() width: string = '100%';
  @Input() height: string = '100%';
  @Input() speed: number = 1;
  @Input() playOnHover: boolean = false;

  private animItem?: AnimationItem;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadAnimation();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isBrowser && (changes['path'] || changes['animationData'])) {
      this.loadAnimation();
    }
  }

  private loadAnimation(): void {
    if (this.animItem) {
      this.animItem.destroy();
    }

    if (!this.container || (!this.path && !this.animationData)) {
      return;
    }

    try {
      const config: any = {
        container: this.container.nativeElement,
        renderer: 'svg',
        loop: this.playOnHover ? false : this.loop,
        autoplay: this.playOnHover ? false : this.autoplay,
      };

      if (this.path) {
        config.path = this.path;
      } else if (this.animationData) {
        config.animationData = this.animationData;
      }

      this.animItem = lottie.loadAnimation(config);
      this.animItem.setSpeed(this.speed);
    } catch (e) {
      console.warn('Lottie loading error:', e);
    }
  }

  onMouseEnter(): void {
    if (this.playOnHover && this.animItem) {
      this.animItem.stop();
      this.animItem.play();
    }
  }

  onMouseLeave(): void {
    if (this.playOnHover && this.animItem) {
      this.animItem.stop();
    }
  }

  ngOnDestroy(): void {
    if (this.animItem) {
      this.animItem.destroy();
    }
  }
}
