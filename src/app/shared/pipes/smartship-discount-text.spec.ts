import { SmartshipDiscountTextPipe } from './smartship-discount-text.pipe';

fdescribe('SmartshipDiscountTextPipe', () => {
  let pipe: SmartshipDiscountTextPipe;

  beforeEach(() => {
    pipe = new SmartshipDiscountTextPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should replace [X] text', () => {
    expect(pipe.transform('[X]% discount', 30)).toBe('30% discount');
  });
});
