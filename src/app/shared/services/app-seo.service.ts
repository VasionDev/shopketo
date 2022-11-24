import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ProductsApiService } from '../../products/services/products-api.service';

@Injectable({
  providedIn: 'root',
})
export class AppSeoService {
  constructor(
    @Inject(DOCUMENT) private dom: Document,
    private titleService: Title,
    private metaService: Meta,
    private productsApiService: ProductsApiService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateTitle(title: string) {
    let updatedTitle = '';

    if (title === '') {
      updatedTitle = 'Keto Supplements From Prüvit';
    } else {
      updatedTitle = title;
    }

    const country = this.document.location.pathname.split('/')[1];

    if (country === 'ca' || country === 'CA') {
      updatedTitle = updatedTitle + ' | Shopketo Canada';
    } else if (country === 'au' || country === 'AU') {
      updatedTitle = updatedTitle + ' | Shopketo Australia';
    } else if (country === 'mo' || country === 'MO') {
      updatedTitle = updatedTitle + ' | Shopketo Macao';
    } else if (country === 'hk' || country === 'HK') {
      updatedTitle = updatedTitle + ' | Shopketo Hong Kong';
    } else if (country === 'sg' || country === 'SG') {
      updatedTitle = updatedTitle + ' | Shopketo Singapore';
    } else if (country === 'my' || country === 'MY') {
      updatedTitle = updatedTitle + ' | Shopketo Malaysia';
    } else if (country === 'mx' || country === 'MX') {
      updatedTitle = updatedTitle + ' | Shopketo Mexico';
    } else if (country === 'nz' || country === 'NZ') {
      updatedTitle = updatedTitle + ' | Shopketo New Zealand';
    } else if (country === 'de' || country === 'DE') {
      updatedTitle = updatedTitle + ' | Shopketo Germany';
    } else if (country === 'gb' || country === 'GB') {
      updatedTitle = updatedTitle + ' | Shopketo United Kingdom';
    } else if (country === 'it' || country === 'IT') {
      updatedTitle = updatedTitle + ' | Shopketo Italy';
    } else if (country === 'es' || country === 'ES') {
      updatedTitle = updatedTitle + ' | Shopketo Spain';
    } else if (country === 'nl' || country === 'NL') {
      updatedTitle = updatedTitle + ' | Shopketo Netherlands';
    } else if (country === 'at' || country === 'AT') {
      updatedTitle = updatedTitle + ' | Shopketo Austria';
    } else if (country === 'pl' || country === 'PL') {
      updatedTitle = updatedTitle + ' | Shopketo Poland';
    } else if (country === 'ie' || country === 'IE') {
      updatedTitle = updatedTitle + ' | Shopketo Ireland';
    } else if (country === 'se' || country === 'SE') {
      updatedTitle = updatedTitle + ' | Shopketo Sweden';
    } else if (country === 'hu' || country === 'HU') {
      updatedTitle = updatedTitle + ' | Shopketo Hungary';
    } else if (country === 'fr' || country === 'FR') {
      updatedTitle = updatedTitle + ' | Shopketo France';
    } else if (country === 'pt' || country === 'PT') {
      updatedTitle = updatedTitle + ' | Shopketo Portugal';
    } else if (country === 'fi' || country === 'FI') {
      updatedTitle = updatedTitle + ' | Shopketo Finland';
    } else if (country === 'be' || country === 'BE') {
      updatedTitle = updatedTitle + ' | Shopketo Belgium';
    } else if (country === 'ro' || country === 'RO') {
      updatedTitle = updatedTitle + ' | Shopketo Romania';
    } else {
      updatedTitle = updatedTitle + ' | Shopketo';
    }

    this.titleService.setTitle(updatedTitle);
  }

  updateDocumentLanguageAndCountry() {
    const country = this.document.location.pathname.split('/')[1];

    let updatedDocsName = '';

    if (country === 'ca' || country === 'CA') {
      updatedDocsName = 'en' + '-' + 'CA';
    } else if (country === 'au' || country === 'AU') {
      updatedDocsName = 'en' + '-' + 'AU';
    } else if (country === 'mo' || country === 'MO') {
      updatedDocsName = 'en' + '-' + 'MO';
    } else if (country === 'hk' || country === 'HK') {
      updatedDocsName = 'zh' + '-' + 'HK';
    } else if (country === 'sg' || country === 'SG') {
      updatedDocsName = 'en' + '-' + 'SG';
    } else if (country === 'my' || country === 'MY') {
      updatedDocsName = 'en' + '-' + 'MY';
    } else if (country === 'mx' || country === 'MX') {
      updatedDocsName = 'es' + '-' + 'MX';
    } else if (country === 'nz' || country === 'NZ') {
      updatedDocsName = 'en' + '-' + 'NZ';
    } else {
      updatedDocsName = 'en' + '-' + 'US';
    }

    this.document.documentElement.lang = updatedDocsName;
  }

  updateRobotsForCountry() {
    let sceletonDomain: string = '';
    let domain: string = this.document.location.href;

    if (domain.includes('https')) {
      sceletonDomain = domain.replace('https://', ' ');
    } else if (domain.includes('http')) {
      sceletonDomain = domain.replace('http://', ' ');
    } else {
      sceletonDomain = domain;
    }
    if (sceletonDomain.includes('www')) {
      sceletonDomain = sceletonDomain.replace('www.', ' ');
    }
    sceletonDomain = sceletonDomain.trim();

    let splitedStr: any[];
    let finalSplittedStr: any[];
    if (sceletonDomain.includes('/')) {
      splitedStr = sceletonDomain.split('/');
      finalSplittedStr = splitedStr[0].split('.');
    } else {
      finalSplittedStr = sceletonDomain.split('.');
    }

    if (finalSplittedStr.length === 3) {
      this.updateRobots('noindex,nofollow');
    } else {
      const country = this.document.location.pathname.split('/')[1];

      const nonCountryArray = [
        'at',
        'be',
        'fi',
        'fr',
        'de',
        'hu',
        'ie',
        'it',
        'nl',
        'pl',
        'pt',
        'es',
        'se',
        'gb',
      ];

      const found = nonCountryArray.includes(country);

      if (found) {
        this.updateRobots('noindex,nofollow');
      } else {
        this.updateRobots('index,follow');
      }
    }
  }

  updateDescription(description: string) {
    let tagDescription = '';

    if (description === '') {
      tagDescription =
        'The Official Prüvit Store. Keto Supplements put your body into ketosis in 30 minutes or less. Keto Products include: Keto Drinks, MCT, Keto Reboot, KETO//UP and more!';
    } else {
      tagDescription = description;
    }

    this.metaService.updateTag({
      name: 'description',
      content: tagDescription,
    });
  }

  updateMeta(metaName: string, metaContent: string) {
    this.metaService.updateTag({
      name: metaName,
      content: metaContent,
    });
  }

  updateRobots(content: string) {
    this.metaService.updateTag({
      name: 'robots',
      content: content,
    });
  }

  setCanonicalLink() {
    const head = this.dom.getElementsByTagName('head')[0];

    var element = this.dom.querySelector(`link[rel='canonical']`) || null;

    if (element === null) {
      element = this.dom.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }

    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', this.dom.URL.split('?')[0]);
  }

  generateSitemapForDynamic(currentCountry: string, selectedLanguage: string) {
    const date = new Date().toISOString().split('T')[0];
    const dynamicFirstHalf = `
      <url>
        <loc>https://shopketo.com/`;
    const dynamicSecondHalf =
      `</loc>
        <lastmod>` +
      date +
      `</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
      </url>
      `;

    let answer = '';

    const staticArr = ['', 'search', 'smartship', 'blog'];

    this.productsApiService
      .getProductsWithLanguage(currentCountry, selectedLanguage)
      .subscribe(({ productsData }) => {
        staticArr.forEach((staticText: string) => {
          if (currentCountry === 'US') {
            answer += dynamicFirstHalf;

            answer += '';
            answer += staticText;

            if (staticText === '') {
              if (productsData.default_lang !== selectedLanguage) {
                answer += '?lang=' + selectedLanguage;
              }
            } else {
              if (productsData.default_lang !== selectedLanguage) {
                answer += '/?lang=' + selectedLanguage;
              }
            }

            answer += dynamicSecondHalf;
          } else {
            answer += dynamicFirstHalf;

            answer += currentCountry.toLowerCase() + '/';
            answer += staticText;

            if (staticText === '') {
              if (productsData.default_lang !== selectedLanguage) {
                answer += '?lang=' + selectedLanguage;
              }
            } else {
              if (productsData.default_lang !== selectedLanguage) {
                answer += '/?lang=' + selectedLanguage;
              }
            }

            answer += dynamicSecondHalf;
          }
        });

        productsData.product_tag.forEach((tag: any) => {
          if (currentCountry === 'US') {
            answer += dynamicFirstHalf;
            answer += 'tag/' + tag.slug;
            if (productsData.default_lang !== selectedLanguage) {
              answer += '/?lang=' + selectedLanguage;
            }
            answer += dynamicSecondHalf;
          } else {
            answer += dynamicFirstHalf;
            answer += currentCountry.toLowerCase() + '/tag/' + tag.slug;
            if (productsData.default_lang !== selectedLanguage) {
              answer += '/?lang=' + selectedLanguage;
            }
            answer += dynamicSecondHalf;
          }
        });

        productsData.parent_category.forEach((category: any) => {
          if (currentCountry === 'US') {
            answer += dynamicFirstHalf;
            answer += 'category/' + category.slug;
            if (productsData.default_lang !== selectedLanguage) {
              answer += '/?lang=' + selectedLanguage;
            }
            answer += dynamicSecondHalf;
          } else {
            answer += dynamicFirstHalf;
            answer +=
              currentCountry.toLowerCase() + '/category/' + category.slug;
            if (productsData.default_lang !== selectedLanguage) {
              answer += '/?lang=' + selectedLanguage;
            }
            answer += dynamicSecondHalf;
          }
        });

        productsData.list.forEach((product: any) => {
          if (currentCountry === 'US') {
            answer += dynamicFirstHalf;
            answer += 'product/' + product.post_name;
            if (productsData.default_lang !== selectedLanguage) {
              answer += '/?lang=' + selectedLanguage;
            }
            answer += dynamicSecondHalf;
          } else {
            answer += dynamicFirstHalf;
            answer +=
              currentCountry.toLowerCase() + '/product/' + product.post_name;
            if (productsData.default_lang !== selectedLanguage) {
              answer += '/?lang=' + selectedLanguage;
            }
            answer += dynamicSecondHalf;
          }
        });

        console.log(answer);
      });
  }

  generateSitemapForAllLinks(
    currentCountry: string,
    selectedLanguage: string,
    otherCountry: string
  ) {
    let answer = '';

    const domain = 'https://shopketo.com';

    const staticArr = ['search', 'smartship', 'blog'];

    this.productsApiService
      .getProductsWithLanguage(currentCountry, selectedLanguage)
      .subscribe(({ productsData }) => {
        staticArr.forEach((staticText: string) => {
          answer += `<url>
            <loc>${domain}/${staticText}</loc>
            <xhtml:link
                       rel="alternate"
                       hreflang="en-${otherCountry}"
                       href="${domain}/${otherCountry}/${staticText}"/>
            <xhtml:link
                       rel="alternate"
                       hreflang="en"
                       href="${domain}/${staticText}"/>
          </url>
          <url>
            <loc>${domain}/${otherCountry}/${staticText}</loc>
             <xhtml:link
                       rel="alternate"
                       hreflang="en-${otherCountry}"
                       href="${domain}/${otherCountry}/${staticText}"/>
            <xhtml:link
                       rel="alternate"
                       hreflang="en"
                       href="${domain}/${staticText}"/>
          </url>
          `;
        });

        productsData.product_tag.forEach((tag: any) => {
          answer += `<url>
          <loc>${domain}/tag/${tag.slug}</loc>
          <xhtml:link
                     rel="alternate"
                     hreflang="en-${otherCountry}"
                     href="${domain}/${otherCountry}/tag/${tag.slug}"/>
          <xhtml:link
                     rel="alternate"
                     hreflang="en"
                     href="${domain}/tag/${tag.slug}"/>
        </url>
        <url>
          <loc>${domain}/${otherCountry}/tag/${tag.slug}</loc>
           <xhtml:link
                     rel="alternate"
                     hreflang="en-${otherCountry}"
                     href="${domain}/${otherCountry}/tag/${tag.slug}"/>
          <xhtml:link
                     rel="alternate"
                     hreflang="en"
                     href="${domain}/tag/${tag.slug}"/>
        </url>
        `;
        });

        productsData.parent_category.forEach((category: any) => {
          answer += `<url>
          <loc>${domain}/category/${category.slug}</loc>
          <xhtml:link
                     rel="alternate"
                     hreflang="en-${otherCountry}"
                     href="${domain}/${otherCountry}/category/${category.slug}"/>
          <xhtml:link
                     rel="alternate"
                     hreflang="en"
                     href="${domain}/category/${category.slug}"/>
        </url>
        <url>
          <loc>${domain}/${otherCountry}/category/${category.slug}</loc>
           <xhtml:link
                     rel="alternate"
                     hreflang="en-${otherCountry}"
                     href="${domain}/${otherCountry}/category/${category.slug}"/>
          <xhtml:link
                     rel="alternate"
                     hreflang="en"
                     href="${domain}/category/${category.slug}"/>
        </url>
        `;
        });

        productsData.list.forEach((product: any) => {
          answer += `<url>
          <loc>${domain}/product/${product.post_name}</loc>
          <xhtml:link
                     rel="alternate"
                     hreflang="en-${otherCountry}"
                     href="${domain}/${otherCountry}/product/${product.post_name}"/>
          <xhtml:link
                     rel="alternate"
                     hreflang="en"
                     href="${domain}/product/${product.post_name}"/>
        </url>
        <url>
          <loc>${domain}/${otherCountry}/product/${product.post_name}</loc>
           <xhtml:link
                     rel="alternate"
                     hreflang="en-${otherCountry}"
                     href="${domain}/${otherCountry}/product/${product.post_name}"/>
          <xhtml:link
                     rel="alternate"
                     hreflang="en"
                     href="${domain}/product/${product.post_name}"/>
        </url>
        `;
        });

        console.log(answer);
      });
  }
}
