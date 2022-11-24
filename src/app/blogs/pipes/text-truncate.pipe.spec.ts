import { TextTruncatePipe } from './text-truncate.pipe';

describe('TextTruncatePipe', () => {
  it('create an instance', () => {
    const pipe = new TextTruncatePipe();
    expect(pipe).toBeTruthy();
  });
});
