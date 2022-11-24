import { Injectable } from '@angular/core';
import { ProductAccess } from 'src/app/shared/models/product-access.model';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import { ProductTagOrCategory } from '../models/product-tag-or-category.model';
import { Product } from '../models/product.model';
import { ProductsUtilityService } from './products-utility.service';

@Injectable()
export class ProductsTagAndCategoryService {
  constructor(
    private productsUtilityService: ProductsUtilityService,
    private userService: AppUserService
  ) {}

  getChildCategoriesOrTags(
    categories: any[],
    childs: ProductTagOrCategory[],
    products?: Product[],
    isCategory?: boolean
  ): ProductTagOrCategory[] {
    const tempChildCategoriesOrTags = categories.map((childCategory: any) => {
      return {
        termId: childCategory.term_id,
        name: childCategory.name,
        description: childCategory.description,
        slug: childCategory.slug,
        parentTermId: childCategory.parent,
        imageUrl: '',
        backgroundColor: '',
        isNew: false,
        order: 0,
        childs,
        products: [],
        customUsers: [],
        accessLevels: {} as ProductAccess,
        isUserCanAccess: true,
        isEveryoneCanAccess: true,
        accessLevelTitle: 'Everyone',
      } as ProductTagOrCategory;
    });

    return products && isCategory
      ? tempChildCategoriesOrTags.map((item) =>
          this.mapProductsToCategoriesOrTags(item, products, isCategory)
        )
      : tempChildCategoriesOrTags;
  }

  getCategoriesOrTags(
    categoriesOrTags: any[],
    products: Product[],
    isCategory: boolean
  ): ProductTagOrCategory[] {
    const tempCategoriesOrTags = categoriesOrTags.map((category: any) => {
      const accessLevels = this.productsUtilityService.getAccessLevels(
        category.meta.hasOwnProperty('availability_for')
          ? category.meta.availability_for[0]
          : ''
      );

      const customUsers = category.hasOwnProperty('custom_users')
        ? category.custom_users?.map((user: string) => +user[0])
        : [];

      return {
        termId: category.term_id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        parentTermId: category.parent,

        order: category.meta.hasOwnProperty('order')
          ? category.meta.order[0]
          : 0,
        backgroundColor: category.meta.hasOwnProperty('cat_bg_color')
          ? category.meta.cat_bg_color[0]
          : '',
        imageUrl: category.meta.hasOwnProperty('mvp_cat_image')
          ? category.meta.mvp_cat_image[0]
          : '',
        isNew:
          category.meta.hasOwnProperty('cat_as_new') &&
          category.meta.cat_as_new[0] === 'on',
        childs: category.hasOwnProperty('child_categories')
          ? this.getChildCategoriesOrTags(
              category.child_categories,
              [],
              products,
              isCategory
            )
          : [],
        products: [],
        customUsers: customUsers,
        accessLevels: accessLevels,
        isUserCanAccess: this.userService.isUserCanAccess(
          accessLevels,
          customUsers
        ),
        isEveryoneCanAccess: this.userService.isEveryoneCanAccess(accessLevels),
        accessLevelTitle: this.userService.accessLevelTitle(accessLevels),
      } as ProductTagOrCategory;
    });

    return tempCategoriesOrTags.map((item) =>
      this.mapProductsToCategoriesOrTags(item, products, isCategory)
    );
  }

  getCategoryInfo(
    tagsOrCategories: ProductTagOrCategory[],
    categorySlug: string
  ) {
    let isParentCategory = false;
    let categoryInfo = {} as ProductTagOrCategory;

    tagsOrCategories.forEach((tagOrCategory) => {
      if (tagOrCategory.slug === categorySlug) {
        isParentCategory = true;
        categoryInfo = tagOrCategory;
      }
    });
    if (!isParentCategory) {
      tagsOrCategories.forEach((parent) => {
        parent.childs.forEach((child) => {
          if (child.slug === categorySlug) {
            categoryInfo = child;
          }
        });
      });
    }

    return { isParent: isParentCategory, category: categoryInfo };
  }

  getParentCategoryForProduct(
    product: Product,
    parentCategories: ProductTagOrCategory[]
  ) {
    let parentCategory = {} as ProductTagOrCategory;

    let parentTermId = 0;
    product.categories.forEach((category: ProductTagOrCategory) => {
      if (category.parentTermId !== 0) {
        parentTermId = category.parentTermId;
      }
    });

    let categorySlug = '';
    parentCategories.forEach((parent: ProductTagOrCategory) => {
      if (parent.termId === parentTermId) {
        categorySlug = parent.slug;
      }
    });

    const categoryInfo = this.getCategoryInfo(parentCategories, categorySlug);

    if (categoryInfo.isParent) {
      parentCategory = categoryInfo.category;
    }

    return parentCategory;
  }

  getChildCategoryForProduct(product: Product) {
    let childCategory = {} as ProductTagOrCategory;

    product.categories.forEach((category) => {
      if (!category.slug.includes('shop-all')) {
        childCategory = category;
      }
    });

    return childCategory;
  }

  private mapProductsToCategoriesOrTags(
    categoryOrTag: ProductTagOrCategory,
    products: Product[],
    isCategory: boolean
  ) {
    const categoryProducts: Product[] = [];

    products = products.filter(
      (p) =>
        !p.accessLevels.isCustom.on &&
        (p.categories.length > 0 || p.tags.length > 0)
    );

    products.forEach((product) => {
      const result = isCategory
        ? product.categories.some(
            (x) =>
              x.termId === categoryOrTag.termId ||
              x.parentTermId === categoryOrTag.termId
          )
        : product.tags.some(
            (x) =>
              x.termId === categoryOrTag.termId ||
              x.parentTermId === categoryOrTag.termId
          );
      if (result) {
        categoryProducts.push(product);
      }
    });

    categoryOrTag.products = categoryProducts;

    return categoryOrTag;
  }
}
