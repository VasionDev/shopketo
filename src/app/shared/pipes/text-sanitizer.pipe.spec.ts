import { DomSanitizer } from '@angular/platform-browser';
import { TextSanitizerPipe } from './text-sanitizer.pipe';

describe('TextSanitizerPipe', () => {
  let sanitizer: DomSanitizer;
  it('create an instance', () => {
    const pipe = new TextSanitizerPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
