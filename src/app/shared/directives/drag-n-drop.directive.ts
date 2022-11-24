import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';
declare var $: any;
@Directive({
  selector: '[appDragNDropDir]',
})
export class DragNDropDirective {
  @Output() fileDropped = new EventEmitter<any>();

  @HostBinding('class.draging') private fileOverClass: boolean = true;

  // Dragover Event
  @HostListener('dragover', ['$event']) onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOverClass = true;
  }

  // Dragleave Event
  @HostListener('dragleave', ['$event']) public onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOverClass = false;
  }

  // Drop Event
  @HostListener('drop', ['$event']) public onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOverClass = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files);
    }
  }
}
