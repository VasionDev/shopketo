import { Injectable } from '@angular/core';
import { AppUserService } from 'src/app/shared/services/app-user.service';
import {
  ProductServing,
  ProductServingObj,
} from '../models/product-serving.model';
import { ProductSettings } from '../models/product-settings.model';
import { ProductVariation } from '../models/product-variation.model';
import { Product } from '../models/product.model';
import { ProductsTagAndCategoryService } from './products-tag-and-category.service';
import { ProductsUtilityService } from './products-utility.service';

interface AvailableAttibutes {
  attr1: Product['availableAttribute1s'];
  attr2: Product['availableAttribute2s'];
  availabelOrderType: Product['availableOrderType'];
}

@Injectable()
export class ProductsFormService {
  constructor(
    private productsTagAndCategoriesService: ProductsTagAndCategoryService,
    private productsUtilityService: ProductsUtilityService,
    private userService: AppUserService
  ) {}

  getProduct(productMap: any, responseData?: any): Product {
    if (!productMap) return {} as Product;

    const productSettings: ProductSettings = responseData
      ? this.getProductSettings(responseData)
      : ({} as ProductSettings);

    const {
      productVariations,
      defaultSelectionObj,
      availableAttributesObj,
      productServings,
    } = this.getProductFormInfo(productMap);

    const { price, discount } = this.getProductPrice(productVariations);

    const product: Product = {
      id: productMap.ID,
      title: productMap.post_title,
      content: productMap.post_content,
      name: productMap.post_name,
      thumbUrl: productMap.post_thumb_url,
      mediumThumbUrl: productMap.post_medium_thumb_url,
      homeThumbUrl: productMap.post_home_thumb_url,
      homeThumbRetinaUrl: productMap.post_home_retina_thumb_url,

      variations: productVariations,
      servings: productServings,
      defaultAttribute1: defaultSelectionObj.attribute1Key,
      defaultAttribute2: defaultSelectionObj.attribute2Key,
      availableAttribute1s: availableAttributesObj.attr1,
      availableAttribute2s: availableAttributesObj.attr2,
      availableOrderType: availableAttributesObj.availabelOrderType,
      sellingClosedText: productMap.mvproduct_selling_closed_text,
      finalPrice: discount,
      originalPrice: price,

      isAllVariationOutOfStock:
        this.checkAllVariationOutOfStock(productVariations),

      categories: this.productsTagAndCategoriesService.getChildCategoriesOrTags(
        productMap.categories,
        []
      ),
      tags: this.productsTagAndCategoriesService.getChildCategoriesOrTags(
        productMap.tags,
        []
      ),
      accessLevels: this.productsUtilityService.getAccessLevels(
        productMap.hasOwnProperty('availability_for')
          ? productMap.availability_for
          : ''
      ),
      flavor:
        productMap.hasOwnProperty('mvproduct_flavor') &&
        productMap.mvproduct_flavor !== ''
          ? productMap.mvproduct_flavor
          : '',
      promoterTitle:
        productMap.hasOwnProperty('mvproduct_banner_title') &&
        productMap.mvproduct_banner_title !== ''
          ? productMap.mvproduct_banner_title
          : '',
      promoterSubtitle:
        productMap.hasOwnProperty('mvproduct_banner_subtitle') &&
        productMap.mvproduct_banner_subtitle !== ''
          ? productMap.mvproduct_banner_subtitle
          : '',
      promoterGradientColor1:
        productMap.hasOwnProperty('mvproduct_promoter_gradient_color_1') &&
        productMap.mvproduct_promoter_gradient_color_1 !== ''
          ? productMap.mvproduct_promoter_gradient_color_1
          : '#204ceb',

      promoterGradientColor2:
        productMap.hasOwnProperty('mvproduct_promoter_gradient_color_2') &&
        productMap.mvproduct_promoter_gradient_color_2 !== ''
          ? productMap.mvproduct_promoter_gradient_color_2
          : '#204ceb',

      customGallery:
        productMap.hasOwnProperty('mvproduct_custom_gallery') &&
        productMap.mvproduct_custom_gallery
          ? productMap.mvproduct_custom_gallery.split(',')
          : [],
      isSoldOut:
        productMap.hasOwnProperty('mvproduct_is_selling_closed') &&
        productMap.mvproduct_is_selling_closed === 'on'
          ? true
          : false,

      shippingNote: responseData
        ? this.getShippingNote(productMap, productSettings)
        : '',
      isForPromoter: responseData
        ? this.checkPromoterProduct(productMap, productSettings)
        : '',
      showRelatedProducts:
        productMap.hasOwnProperty('mvproduct_related_products_show') &&
        productMap.mvproduct_related_products_show === 'on',
      relatedProducts: productMap.hasOwnProperty('mvproduct_related_products')
        ? productMap.mvproduct_related_products
        : [],
      isForLimitedPromoter:
        productMap.hasOwnProperty('promoter_limited_offer') &&
        productMap.promoter_limited_offer === 'on',
      promoterOrder: productMap.hasOwnProperty('mvproduct_promoter_seq')
        ? +productMap.mvproduct_promoter_seq
        : 0,
      promoterPageImageUrl: productMap.hasOwnProperty(
        'mvproduct_benefits_image'
      )
        ? productMap.mvproduct_benefits_image
        : '',
      promoterTooltipNote: productMap.hasOwnProperty('mvproduct_short_note')
        ? productMap.mvproduct_short_note
        : '',
      isMostPopular:
        productMap.hasOwnProperty('mvproduct_most_popular') &&
        productMap.mvproduct_most_popular === 'on',
      learnPageTitle: productMap.hasOwnProperty('mvproduct_learn_title')
        ? productMap.mvproduct_learn_title
        : '',
      learnPageSubTitle: productMap.hasOwnProperty('mvproduct_learn_subtitle')
        ? productMap.mvproduct_learn_subtitle
        : '',
      productOrder: productMap.hasOwnProperty('mvproduct_order_seq')
        ? productMap.mvproduct_order_seq
        : 0,
      customUsers: productMap.hasOwnProperty('mvp_custom_users_list')
        ? productMap.mvp_custom_users_list?.map((user: string) => +user[0])
        : [],
      bannerLinkTitle: productMap.banner_link_label
        ? productMap.banner_link_label
        : '',
      bannerLink: productMap.banner_link_url ? productMap.banner_link_url : '',
      wistiaVideoLink: productMap.mvproduct_wistia_video_link
        ? productMap.mvproduct_wistia_video_link
        : '',
      bannerDiscription: productMap.mvproduct_banner_description
        ? productMap.mvproduct_banner_description
        : '',
      bannerStartDate: productMap.hasOwnProperty('mvp_slider_start_date')
        ? productMap.mvp_slider_start_date
        : '',
      bannerStartTime: productMap.hasOwnProperty('mvp_slider_start_time')
        ? productMap.mvp_slider_start_time
        : '',
      bannerEndDate: productMap.hasOwnProperty('mvp_slider_end_date')
        ? productMap.mvp_slider_end_date
        : '',
      bannerEndTime: productMap.hasOwnProperty('mvp_slider_end_time')
        ? productMap.mvp_slider_end_time
        : '',
      bannerFeatureImage: productMap.hasOwnProperty('mvp_slider_feature_image')
        ? productMap.mvp_slider_feature_image
        : '',
      bannerBgColor1: productMap.hasOwnProperty('mvp_slider_bgcolor_1')
        ? productMap.mvp_slider_bgcolor_1
        : '',
      bannerBgColor2: productMap.hasOwnProperty('mvp_slider_bgcolor_2')
        ? productMap.mvp_slider_bgcolor_2
        : '',
      bannerHeadline: productMap.hasOwnProperty('mvp_slider_headline')
        ? productMap.mvp_slider_headline
        : '',
      bannerImage: productMap.hasOwnProperty('mvp_slider_image')
        ? productMap.mvp_slider_image
        : '',
      bannerStartUnixTime: productMap.hasOwnProperty(
        'mvp_slider_starttime_unix'
      )
        ? +productMap.mvp_slider_starttime_unix
        : 0,
      bannerEndUnixTime: productMap.hasOwnProperty('mvp_slider_endtime_unix')
        ? +productMap.mvp_slider_endtime_unix
        : 0,
    };

    return product;
  }

  private getProductFormInfo(product: any): {
    productVariations: ProductVariation[];
    defaultSelectionObj: ProductServingObj['keys'];
    availableAttributesObj: AvailableAttibutes;
    productServings: ProductServing[];
  } {
    const defaultSelectionObj: ProductServingObj['keys'] = {
      attribute1Key: '',
      attribute2Key: '',
    };

    const availableAttributesObj: AvailableAttibutes = {
      attr1: [],
      attr2: [],
      availabelOrderType: [],
    };

    let productVariations: ProductVariation[] = [];

    const productVariationEntries = product.hasOwnProperty('mvp_variations')
      ? Object.entries(product.mvp_variations).filter(
          (variationObjArray: any[]) =>
            variationObjArray[1].hasOwnProperty('variation_is_active') &&
            variationObjArray[1].variation_is_active === 'on'
        )
      : [];

    const { keys, values } = new ProductServingObj(product);
    const servingKeys = keys;
    const productServings: ProductServing[] = values;

    productVariationEntries.forEach((item: any[]) => {
      const varItem = item[1];

      const attribute1 = varItem[servingKeys.attribute1Key];
      const attribute2 = varItem[servingKeys.attribute2Key]
        ? varItem[servingKeys.attribute2Key]
        : '';

      if (product.mvproduct_default_var === varItem.prod_var_unique_id) {
        defaultSelectionObj.attribute1Key = attribute1;
        defaultSelectionObj.attribute2Key = attribute2 ? attribute2 : '';
      }

      if (
        attribute1 &&
        !availableAttributesObj.attr1.some((item) => item === attribute1)
      ) {
        availableAttributesObj.attr1.push(attribute1);
      }

      if (
        attribute2 &&
        !availableAttributesObj.attr2.some((item) => item === attribute2)
      ) {
        availableAttributesObj.attr2.push(attribute2);
      }

      if (
        varItem.mvproduct_ordertype &&
        !availableAttributesObj.availabelOrderType.some(
          (item) => item === varItem.mvproduct_ordertype
        )
      ) {
        availableAttributesObj.availabelOrderType.push(
          varItem.mvproduct_ordertype
        );
      }
    });

    productVariations = productVariationEntries.map((variation) => {
      return new ProductVariation(
        productVariationEntries,
        variation,
        servingKeys,
        this.productsUtilityService
      );
    });

    return {
      productVariations,
      defaultSelectionObj,
      availableAttributesObj,
      productServings,
    };
  }

  private checkAllVariationOutOfStock(variations: ProductVariation[]) {
    let isAllOutOfStock = true;

    variations.forEach((variation) => {
      if (!variation.isOutOfStock) {
        isAllOutOfStock = false;
      }
    });

    return isAllOutOfStock;
  }

  getProductPrice(variations: ProductVariation[]) {
    let minPrice = Number.MAX_SAFE_INTEGER;
    let discountPrice = 0;

    variations.forEach((variation) => {
      if (variation.orderType === 'ordertype_1' && variation.price < minPrice) {
        minPrice = variation.price;

        const isUserCanAccess = this.userService.checkUserAccess(
          variation.accessLevels,
          variation.customUsers
        );

        if (isUserCanAccess) {
          if (variation.discountPrice !== 0) {
            if (variation.smartshipDiscountPrice !== 0) {
              discountPrice = Math.min(
                variation.discountPrice,
                variation.smartshipDiscountPrice
              );
            } else {
              discountPrice = variation.discountPrice;
            }
          } else {
            if (variation.smartshipDiscountPrice !== 0) {
              discountPrice = variation.smartshipDiscountPrice;
            } else {
              discountPrice = 0;
            }
          }
        }
      }
    });

    if (minPrice === Number.MAX_SAFE_INTEGER) {
      minPrice = 0;
    }

    return { price: minPrice, discount: discountPrice };
  }

  getProductSettings(productSettingsData: any) {
    const productSettings: ProductSettings = {
      defaultLanguage: productSettingsData.hasOwnProperty('default_lang')
        ? productSettingsData.default_lang
        : 'en',
      isPromoterEnabled:
        productSettingsData.product_settings.hasOwnProperty('promoter_open') &&
        productSettingsData.product_settings.promoter_open === 'on',

      isDefaultShippingNoteEnabled:
        productSettingsData.general_settings.hasOwnProperty(
          'default_shipping_note'
        ) && productSettingsData.general_settings.default_shipping_note === 1,
      defaultShippingNote: productSettingsData.general_settings.hasOwnProperty(
        'default_shipping_note_text'
      )
        ? productSettingsData.general_settings.default_shipping_note_text
        : '',
      exchangeRate:
        productSettingsData.product_settings.hasOwnProperty('exchange_rate') &&
        productSettingsData.product_settings.exchange_rate !== ''
          ? +productSettingsData.product_settings.exchange_rate
          : 0,
      taxRate:
        productSettingsData.product_settings.hasOwnProperty('tax_rate') &&
        productSettingsData.product_settings.tax_rate !== ''
          ? +productSettingsData.product_settings.tax_rate
          : 0,
      currencySymbol:
        productSettingsData.product_settings.hasOwnProperty('exchange_rate') &&
        productSettingsData.product_settings.exchange_rate !== ''
          ? productSettingsData.product_settings.currency_symbol
          : '$',
      privacyUrl: productSettingsData.general_settings.hasOwnProperty('privacy')
        ? productSettingsData.general_settings.privacy
        : '',
      promoterSku: productSettingsData.product_settings.hasOwnProperty(
        'new_promoter_sku'
      )
        ? productSettingsData.product_settings.new_promoter_sku
        : '',
      promoterPrice: productSettingsData.product_settings.hasOwnProperty(
        'new_promoter_price'
      )
        ? productSettingsData.product_settings.new_promoter_price
        : 0,
      checkoutFullPath: productSettingsData.product_settings.hasOwnProperty(
        'checkout_url'
      )
        ? productSettingsData.product_settings.checkout_url
        : '',
    };
    return productSettings;
  }

  private getShippingNote(product: any, productSettings: ProductSettings) {
    return product.mvproduct_shipping_popup_note !== ''
      ? product.mvproduct_shipping_popup_note
      : productSettings.isDefaultShippingNoteEnabled
      ? productSettings.defaultShippingNote
      : '';
  }

  private checkPromoterProduct(product: any, productSettings: ProductSettings) {
    return (
      productSettings.isPromoterEnabled &&
      product.hasOwnProperty('mvproduct_forpromoter') &&
      product.mvproduct_forpromoter === 'on'
    );
  }

  getRelatedProducts(product: any, products: Product[]) {
    const relatedProducts: Product[] = [];

    product.relatedProducts.forEach((productID: string) => {
      products.forEach((p) => {
        if (p.id === +productID) {
          p.relatedProducts = [];
          relatedProducts.push(p);
        }
      });
    });

    return relatedProducts;
  }
}
