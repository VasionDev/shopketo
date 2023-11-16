import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Blog } from 'src/app/blogs/models/blog.model';
import { ProductTagOrCategory } from 'src/app/products/models/product-tag-or-category.model';
import { Product } from 'src/app/products/models/product.model';
import { Offer } from 'src/app/shared/models/offer.model';
import { Cart } from '../models/cart.model';
import { ProductData } from '../models/product-data.model';

@Injectable({
  providedIn: 'root',
})
export class AppDataService {
  private searchKeyValue: string = '';

  private productsData: BehaviorSubject<ProductData> = new BehaviorSubject(
    {} as ProductData
  );

  private tags: BehaviorSubject<ProductTagOrCategory[]> = new BehaviorSubject<
    ProductTagOrCategory[]
  >([]);

  private categories: BehaviorSubject<ProductTagOrCategory[]> =
    new BehaviorSubject<ProductTagOrCategory[]>([]);

  private childCategories: BehaviorSubject<ProductTagOrCategory[]> =
    new BehaviorSubject<ProductTagOrCategory[]>([]);

  private modalName: Subject<{
    postName: string;
    payload?: { key: string; value: any };
  }> = new Subject();

  private selectedlanguage = new BehaviorSubject('en');

  private referrerData = new BehaviorSubject(false);
  private isMobileView = new BehaviorSubject(false);

  private selectedCountry = new BehaviorSubject('');

  private redirectURL = new BehaviorSubject('');

  private searchFocus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  private discountHeight = new BehaviorSubject(0);

  private cartPageCheckoutBtnHeight = new BehaviorSubject(0);

  private pruvitTvLink = new BehaviorSubject('');

  private isFromSmartship = new BehaviorSubject(false);

  private redirectedCountry: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  private pageSlug = new BehaviorSubject({});

  private isCheckout = new BehaviorSubject(false);
  private isAdminUser = new BehaviorSubject(false);
  private isChampion = new BehaviorSubject(false);

  private isImpersonationPresent = new BehaviorSubject(false);

  private isSubdomain = new BehaviorSubject(false);

  private offerArray: BehaviorSubject<{
    offer: Offer[];
    index: number;
  }> = new BehaviorSubject<{ offer: Offer[]; index: number }>({
    offer: [],
    index: 0,
  });

  private trainingData: BehaviorSubject<[]> = new BehaviorSubject([]);
  private trainingCategory: BehaviorSubject<{}> = new BehaviorSubject({});
  private trainingCategoryList: BehaviorSubject<any[]> = new BehaviorSubject([
    {},
  ]);
  private smartshipCart: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private bundleBuilderCart: BehaviorSubject<Cart[]> = new BehaviorSubject<Cart[]>([]);

  private isOfferFlow = new BehaviorSubject(false);

  private blogsData: BehaviorSubject<Blog[]> = new BehaviorSubject<Blog[]>([]);

  private pulseProProduct: BehaviorSubject<Product> = new BehaviorSubject(
    {} as Product
  );

  private isCheckoutFromFood = new BehaviorSubject(false);

  private showCookieDialog = new BehaviorSubject(false);

  private tinyUrl: BehaviorSubject<{
    isConversionStarted: boolean;
    url: string;
  }> = new BehaviorSubject<{ isConversionStarted: boolean; url: string }>({
    isConversionStarted: false,
    url: '',
  });

  private sidebarName: Subject<string> = new Subject();

  private cartStatus: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);

  private countries = new BehaviorSubject(false);

  private promoterCart: BehaviorSubject<Cart[]> = new BehaviorSubject<Cart[]>(
    []
  );

  private cartOrCheckoutModal = new BehaviorSubject('');

  private languagesData = new BehaviorSubject(false);

  private viOffer = new BehaviorSubject(false);

  private viTimer = new BehaviorSubject('');

  private userWithScopes: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private userProfile: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private promoterMembership: Product | null = null;
  private isBundleBuilderCheckout: boolean = false;

  setBBCheckoutStatus(status: boolean) {
    this.isBundleBuilderCheckout = status;
  }

  getBBCheckoutStatus() {
    return this.isBundleBuilderCheckout;
  }

  private categoryUniqueID: string ='';

  private isCountrySwithched: boolean = false;

  get currentTags$() {
    return this.tags.asObservable();
  }

  get currentCategories$() {
    return this.categories.asObservable();
  }

  get currentChildCategories$() {
    return this.childCategories.asObservable();
  }

  get currentProductsData$() {
    return this.productsData.asObservable();
  }

  get currentModalName$() {
    return this.modalName.asObservable();
  }

  get adminStatus$() {
    return this.isAdminUser.asObservable();
  }

  get championStatus$() {
    return this.isChampion.asObservable();
  }

  get impersonationStatus$() {
    return this.isImpersonationPresent.asObservable();
  }

  get smartshipCartList$() {
    return this.smartshipCart.asObservable();
  }

  get bundleBuilderCartList$() {
    return this.bundleBuilderCart.asObservable();
  }

  get currentSelectedLanguage$() {
    return this.selectedlanguage.asObservable();
  }

  get currentReferrerData$() {
    return this.referrerData.asObservable();
  }

  get currentSelectedCountry$() {
    return this.selectedCountry.asObservable();
  }

  get currentRedirectURL$() {
    return this.redirectURL.asObservable();
  }

  get isSearchFocused$() {
    return this.searchFocus.asObservable();
  }

  get currentDiscountHeight$() {
    return this.discountHeight.asObservable();
  }

  get currentCheckoutBtnHeight$() {
    return this.cartPageCheckoutBtnHeight.asObservable();
  }

  get currentPruvitTvLink$() {
    return this.pruvitTvLink.asObservable();
  }

  get currentIsFromSmartship$() {
    return this.isFromSmartship.asObservable();
  }

  get currentRedictedCountry$() {
    return this.redirectedCountry.asObservable();
  }

  get currentPageSlug$() {
    return this.pageSlug.asObservable();
  }

  get currentIsCheckout$() {
    return this.isCheckout.asObservable();
  }

  get currentOfferArray$() {
    return this.offerArray.asObservable();
  }

  get currentOfferFlowStatus$() {
    return this.isOfferFlow.asObservable();
  }

  get currentIsSubdomain$() {
    return this.isSubdomain.asObservable();
  }

  get currentPulseProProduct$() {
    return this.pulseProProduct.asObservable();
  }

  get currentCookieDialogStatus$() {
    return this.showCookieDialog.asObservable();
  }

  get currentBlogsData$() {
    return this.blogsData.asObservable();
  }

  get currentTinyUrl$() {
    return this.tinyUrl.asObservable();
  }

  get currentSidebarName$() {
    return this.sidebarName.asObservable();
  }

  get currentIsCheckoutFromFood$() {
    return this.isCheckoutFromFood.asObservable();
  }

  get currentCartStatus$() {
    return this.cartStatus.asObservable();
  }

  get currentCountries$() {
    return this.countries.asObservable();
  }

  get currentPromoterCart$() {
    return this.promoterCart.asObservable();
  }

  get currentCartOrCheckoutModal$() {
    return this.cartOrCheckoutModal.asObservable();
  }

  get currentLanguagesData$() {
    return this.languagesData.asObservable();
  }

  get currentViOffer$() {
    return this.viOffer.asObservable();
  }

  get currentViTimer$() {
    return this.viTimer.asObservable();
  }

  get currentUserWithScopes$() {
    return this.userWithScopes.asObservable();
  }

  get trainingData$() {
    return this.trainingData.asObservable();
  }

  get currentTrainingCategory$() {
    return this.trainingCategory.asObservable();
  }

  get trainingCategoryList$() {
    return this.trainingCategoryList.asObservable();
  }

  get currentUserProfile$() {
    return this.userProfile.asObservable();
  }

  setProductsData(data: ProductData) {
    this.productsData.next(data);
  }

  setTrainingData(data: []) {
    this.trainingData.next(data);
  }

  setTrainingCategoryList(data: any[]) {
    this.trainingCategoryList.next(data);
  }

  setSmartshipCart(data: any[]) {
    this.smartshipCart.next(data);
  }

  setBundleBuilderCart(data: Cart[]) {
    this.bundleBuilderCart.next(data);
  }

  setCurrentTrainingCategory(data: {}) {
    this.trainingCategory.next(data);
  }

  changePostName(data: {
    postName: string;
    payload?: { key: string; value: any };
  }) {
    this.modalName.next(data);
  }

  changeSelectedLanguage(data: any) {
    this.selectedlanguage.next(data);
  }

  setReferrer(data: any) {
    this.referrerData.next(data);
  }

  changeSelectedCountry(data: any) {
    this.selectedCountry.next(data);
  }

  changeRedirectURL(name: string) {
    this.redirectURL.next(name);
  }

  changeSearchFocusStatus(status: boolean) {
    this.searchFocus.next(status);
  }

  changeDiscountHeight(height: number) {
    this.discountHeight.next(height);
  }

  changeCheckoutBtnHeight(height: number) {
    this.cartPageCheckoutBtnHeight.next(height);
  }

  setPruvitTvLink(link: string) {
    this.pruvitTvLink.next(link);
  }

  setIsFromSmartshipStatus(status: boolean) {
    this.isFromSmartship.next(status);
  }

  setAdminStatus(value: boolean) {
    this.isAdminUser.next(value);
  }

  setChampionStatus(value: boolean) {
    this.isChampion.next(value);
  }

  setImpersonationStatus(value: boolean) {
    this.isImpersonationPresent.next(value);
  }

  changeRedirectedCountry(country: string) {
    this.redirectedCountry.next(country);
  }

  setPageSlug(data: { url?: string; elementId?: number }) {
    this.pageSlug.next(data);
  }
  
  setIsCheckoutStatus(status: boolean) {
    this.isCheckout.next(status);
  }

  setIsSubdomainStatus(status: boolean) {
    this.isSubdomain.next(status);
  }

  setOfferArray(offerArray: Offer[], offerIndex: number) {
    this.offerArray.next({ offer: offerArray, index: offerIndex });
  }

  setOfferFlowStatus(status: boolean) {
    this.isOfferFlow.next(status);
  }

  setBlogsData(blogs: Blog[]) {
    this.blogsData.next(blogs);
  }

  setPulseProProduct(product: Product) {
    this.pulseProProduct.next(product);
  }

  setIsCheckoutFromFoodStatus(status: boolean) {
    this.isCheckoutFromFood.next(status);
  }

  setCookieDialogStatus(status: boolean) {
    this.showCookieDialog.next(status);
  }

  setTinyUrl(tinyUrl: { isConversionStarted: boolean; url: string }) {
    this.tinyUrl.next(tinyUrl);
  }

  changeSidebarName(message: string) {
    this.sidebarName.next(message);
  }

  changeCartStatus(data: boolean) {
    this.cartStatus.next(data);
  }

  setCountries(data: any) {
    this.countries.next(data);
  }

  setPromoterCartData(data: Cart[]) {
    this.promoterCart.next(data);
  }

  changeCartOrCheckoutModal(name: string) {
    this.cartOrCheckoutModal.next(name);
  }

  setLanguagesData(data: any) {
    this.languagesData.next(data);
  }

  setViOffer(status: boolean) {
    this.viOffer.next(status);
  }

  setViTimer(expiryTime: string) {
    this.viTimer.next(expiryTime);
  }

  setUserWithScopes(data: any) {
    this.userWithScopes.next(data);
  }

  setUserProfile(data: any) {
    this.userProfile.next(data);
  }

  setTags(tags: ProductTagOrCategory[]) {
    this.tags.next(tags);
  }

  setCategories(categories: ProductTagOrCategory[]) {
    this.categories.next(categories);
  }

  setChildCategories(categories: ProductTagOrCategory[]) {
    this.childCategories.next(categories);
  }

  setPromoterMembership(product: Product | null) {
    this.promoterMembership = product;
  }

  getPromoterMembership() {
    return this.promoterMembership;
  }

  set searchKey(data: string) {
    this.searchKeyValue = data;
  }

  get searchKey() {
    return this.searchKeyValue;
  }

  setCurrentCategoryUniqueID(id: string){
    this.categoryUniqueID = id;
  }

  getCurrentCategoryUniqueID(){
    return this.categoryUniqueID;
  }

  setMobileView(view: boolean) {
    this.isMobileView.next(view);
  }

  get mobileView$() {
    return this.isMobileView.asObservable();
  }

  isProductHasOrderTypeOne(product: Product) {
    return product.variations.some(varEl => varEl.orderType === 'ordertype_1')
  }
}
