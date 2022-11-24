import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Blog } from '../models/blog.model';

import { BlogApiService } from './blog-api.service';

fdescribe('BlogApiService', () => {
  let blogApiService: BlogApiService;
  let httpTestCtrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogApiService], // actual api needed for httpTestingController
    });

    blogApiService = TestBed.inject(BlogApiService);
    httpTestCtrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestCtrl.verify();
  });

  it('should be created', () => {
    expect(blogApiService).toBeTruthy();
  });

  it('should test blog data get', () => {
    const blogsTest = [
      {
        id: 398,

        slug: 'maxq',
        title: {
          rendered: 'Event: MaxQ October 2-3, 2016',
        },
        content: {
          rendered:
            '<div class="vc_row wpb_row vc_row-fluid vc_custom_1474698630284 full-width"><div class="wpb_column vc_column_container vc_col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper">\n\t<div class="wpb_text_column wpb_content_element " >\n\t\t<div class="wpb_wrapper">\n\t\t\t<div class="wistia_responsive_padding" style="padding: 56.25% 0 0 0; position: relative;">\n<div class="wistia_responsive_wrapper" style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"><iframe loading="lazy" class="wistia_embed" src="//fast.wistia.net/embed/iframe/x5xgnhk3dg?videoFoam=true" name="wistia_embed" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen="allowfullscreen"></iframe></div>\n</div>\n<p><script src="//fast.wistia.net/assets/external/E-v1.js" async></script></p>\n\n\t\t</div>\n\t</div>\n<div class="vc_empty_space"   style="height: 40px"><span class="vc_empty_space_inner"></span></div>\n\t<div  class="wpb_single_image wpb_content_element vc_align_center">\n\t\t\n\t\t<figure class="wpb_wrapper vc_figure">\n\t\t\t<div class="vc_single_image-wrapper   vc_box_border_grey"><img width="1100" height="1700" src="https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2.jpg" class="vc_single_image-img attachment-full" alt="" loading="lazy" title="max-q-flyer-v2" srcset="https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2.jpg 1100w, https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2-194x300.jpg 194w, https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2-768x1187.jpg 768w, https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2-663x1024.jpg 663w" sizes="(max-width: 1100px) 100vw, 1100px" /></div>\n\t\t</figure>\n\t</div>\n<div class="vc_empty_space"   style="height: 40px"><span class="vc_empty_space_inner"></span></div>\n\t<div class="wpb_text_column wpb_content_element " >\n\t\t<div class="wpb_wrapper">\n\t\t\t<h2 style="text-align: center;">Early bird tickets are now available, via your Cloud store.</h2>\n\n\t\t</div>\n\t</div>\n<div class="vc_empty_space"   style="height: 40px"><span class="vc_empty_space_inner"></span></div><div class="vc_btn3-container vc_btn3-center" ><a class="vc_general vc_btn3 vc_btn3-size-lg vc_btn3-shape-round vc_btn3-style-flat vc_btn3-color-primary" href="https://cloud.justpruvit.com/#/catalog-simple?products=EVENT-OCT2-2016-MAXQ-EB:1" title="">US Promoters - Click here to get tickets</a></div><div class="vc_btn3-container vc_btn3-center" ><a class="vc_general vc_btn3 vc_btn3-size-lg vc_btn3-shape-round vc_btn3-style-flat vc_btn3-color-primary" href="https://cloud.justpruvit.com/#/catalog-simple?products=EVENT-OCT2-2016-MAXQ-EB-CA:1" title="">Canada Promoters - Click here to get tickets</a></div>\n\t<div class="wpb_text_column wpb_content_element " >\n\t\t<div class="wpb_wrapper">\n\t\t\t<p style="text-align: center;">If you don&#8217;t already have an account, please contact the person who told you about Prüvit.</p>\n\n\t\t</div>\n\t</div>\n</div></div></div></div>\n',
          protected: false,
        },
        excerpt: {
          rendered:
            "Early bird tickets are now available, via your Cloud store. US Promoters - Click here to get ticketsCanada Promoters - Click here to get tickets If you don't already have an account, please contact the person who told you about Prüvit.",
          protected: false,
        },
        author: 2,
        meta: [],
        categories: [17],
        tags: [],
        metadata: {},
        thumb_url:
          'https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/thumb-max-q-1.jpg',
      },
    ];

    const blogReceivedData: Blog[] = [
      {
        id: 398,
        title: 'Event: MaxQ October 2-3, 2016',
        content:
          '<div class="vc_row wpb_row vc_row-fluid vc_custom_1474698630284 full-width"><div class="wpb_column vc_column_container vc_col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper">\n\t<div class="wpb_text_column wpb_content_element " >\n\t\t<div class="wpb_wrapper">\n\t\t\t<div class="wistia_responsive_padding" style="padding: 56.25% 0 0 0; position: relative;">\n<div class="wistia_responsive_wrapper" style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"><iframe loading="lazy" class="wistia_embed" src="//fast.wistia.net/embed/iframe/x5xgnhk3dg?videoFoam=true" name="wistia_embed" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen="allowfullscreen"></iframe></div>\n</div>\n<p><script src="//fast.wistia.net/assets/external/E-v1.js" async></script></p>\n\n\t\t</div>\n\t</div>\n<div class="vc_empty_space"   style="height: 40px"><span class="vc_empty_space_inner"></span></div>\n\t<div  class="wpb_single_image wpb_content_element vc_align_center">\n\t\t\n\t\t<figure class="wpb_wrapper vc_figure">\n\t\t\t<div class="vc_single_image-wrapper   vc_box_border_grey"><img width="1100" height="1700" src="https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2.jpg" class="vc_single_image-img attachment-full" alt="" loading="lazy" title="max-q-flyer-v2" srcset="https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2.jpg 1100w, https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2-194x300.jpg 194w, https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2-768x1187.jpg 768w, https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/Max-Q-Flyer-v2-663x1024.jpg 663w" sizes="(max-width: 1100px) 100vw, 1100px" /></div>\n\t\t</figure>\n\t</div>\n<div class="vc_empty_space"   style="height: 40px"><span class="vc_empty_space_inner"></span></div>\n\t<div class="wpb_text_column wpb_content_element " >\n\t\t<div class="wpb_wrapper">\n\t\t\t<h2 style="text-align: center;">Early bird tickets are now available, via your Cloud store.</h2>\n\n\t\t</div>\n\t</div>\n<div class="vc_empty_space"   style="height: 40px"><span class="vc_empty_space_inner"></span></div><div class="vc_btn3-container vc_btn3-center" ><a class="vc_general vc_btn3 vc_btn3-size-lg vc_btn3-shape-round vc_btn3-style-flat vc_btn3-color-primary" href="https://cloud.justpruvit.com/#/catalog-simple?products=EVENT-OCT2-2016-MAXQ-EB:1" title="">US Promoters - Click here to get tickets</a></div><div class="vc_btn3-container vc_btn3-center" ><a class="vc_general vc_btn3 vc_btn3-size-lg vc_btn3-shape-round vc_btn3-style-flat vc_btn3-color-primary" href="https://cloud.justpruvit.com/#/catalog-simple?products=EVENT-OCT2-2016-MAXQ-EB-CA:1" title="">Canada Promoters - Click here to get tickets</a></div>\n\t<div class="wpb_text_column wpb_content_element " >\n\t\t<div class="wpb_wrapper">\n\t\t\t<p style="text-align: center;">If you don&#8217;t already have an account, please contact the person who told you about Prüvit.</p>\n\n\t\t</div>\n\t</div>\n</div></div></div></div>\n',
        imageUrl:
          'https://dmo-shopketo-backend.azurewebsites.net/wp-content/uploads/2016/09/thumb-max-q-1.jpg',
        slug: 'maxq',
        description: [''],
        authorId: 2,
        categoryIds: [17],
        tags: [],
      },
    ];

    blogApiService.getBlogs('US').subscribe((blogs) => {
      expect(blogReceivedData).toEqual(blogs);
    });

    const req = httpTestCtrl.expectOne(
      environment.apiDomain + '/' + blogApiService.blogsPath
    );
    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toEqual('json');

    req.flush(blogsTest);
  });

  it('should test blog data post', () => {
    const newPost = {
      author_name: 'test',
      author_email: 'email@test.com',
      content: 'test content',
      post: 1,
    };

    blogApiService.postComment(newPost).subscribe((receivedPost) => {
      expect(receivedPost).toBe(newPost);
    });

    const req = httpTestCtrl.expectOne(
      environment.apiDomain + '/' + blogApiService.commentsPath
    );
    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toBe('json');

    req.flush(newPost);
  });

  it('should send 404 error on blog get', () => {
    const errorMsg = 'could not found the request';

    blogApiService.getBlogs('US').subscribe(
      (blogs) => {
        fail('error with 404');
      },
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404);
        expect(error.error).toEqual(errorMsg);
      }
    );

    const req = httpTestCtrl.expectOne(
      environment.apiDomain + '/' + blogApiService.blogsPath
    );

    req.flush(errorMsg, { status: 404, statusText: 'NOT FOUND' });
  });
});
