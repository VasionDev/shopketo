import { ProductsUtilityService } from '../services/products-utility.service';
import { SortPipe } from './sort.pipe';

describe('SortPipe', () => {
  let productsUtilityService: ProductsUtilityService;
  it('create an instance', () => {
    const pipe = new SortPipe(productsUtilityService);
    expect(pipe).toBeTruthy();
  });
});
