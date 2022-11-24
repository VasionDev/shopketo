export interface ProductServing {
  servingTitle: string;
  servingAttributes: ProductServingAttribute[];
}

export interface ProductServingAttribute {
  key: string;
  name: string;
  isOutOfStock: boolean;
  isAvailable: boolean;
}

export class ProductServingObj {
  public keys: {
    attribute1Key: string;
    attribute2Key: string;
  };
  public values: ProductServing[];

  private _servings: ProductServing[] = [];
  private _attribute1Key = '';
  private _attribute2Key = '';

  constructor(productResponse: any) {
    Object.entries(productResponse.mvp_attributes).forEach(
      (serving: any, index) => {
        if (index === 0) {
          this._attribute1Key = serving[0];
        }

        if (index > 0) {
          this._attribute2Key = serving[0];
        }

        const attributeArr: ProductServing['servingAttributes'] = [];
        Object.entries(serving[1].attribute_items.items).forEach(
          (attribute: any) => {
            if (attribute.mvproduct_attribute_item !== '') {
              attributeArr.push({
                key: attribute[0],
                name: attribute[1].mvproduct_attribute_item,
                isOutOfStock: false,
                isAvailable: true,
              });
            }
          }
        );

        this._servings.push({
          servingTitle: serving[1].mvproduct_attribute_title,
          servingAttributes: attributeArr,
        });
      }
    );

    this.keys = {
      attribute1Key: this._attribute1Key,
      attribute2Key: this._attribute2Key,
    };

    this.values = this._servings;
  }
}
