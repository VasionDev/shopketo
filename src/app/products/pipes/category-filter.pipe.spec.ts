import { CategoryFilterPipe } from './category-filter.pipe';

fdescribe('CategorySearchPipe', () => {
  it('create an instance', () => {
    const pipe = new CategoryFilterPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return empty array if products array is empty', () => {
    const pipe = new CategoryFilterPipe();

    expect(pipe.transform([], '')).toEqual([]);
  });
});
