import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Research } from '../models/research.model';

@Injectable()
export class ResearchApiService {
  domainPath: string;
  apiPath = 'wp-json/wp/pruvitnow/research-videos';

  constructor(private http: HttpClient) {
    this.domainPath = environment.apiDomain;
  }

  getResearchVideos(
    country: string,
    language: string,
    defaultLanguage: string
  ) {
    let fullApiPath = '';

    if (country.toLowerCase() === 'us') {
      if (language !== 'en' && defaultLanguage !== language) {
        fullApiPath =
          this.domainPath + '/' + this.apiPath + '/?lang=' + language;
      } else {
        fullApiPath = this.domainPath + '/' + this.apiPath;
      }
    } else {
      if (language !== 'en' && defaultLanguage !== language) {
        fullApiPath =
          this.domainPath +
          '/' +
          country.toLowerCase() +
          '/' +
          this.apiPath +
          '/?lang=' +
          language;
      } else {
        fullApiPath =
          this.domainPath + '/' + country.toLowerCase() + '/' + this.apiPath;
      }
    }

    return this.http
      .get<any[]>(fullApiPath)
      .pipe(
        mergeMap((arr: any[]) => {
          return arr.length > 0
            ? forkJoin(
                arr.map((item: any) => {
                  const isYoutubeVideo = this.checkYoutubeVideo(
                    item.metadata.mvresearch_video_url[0]
                  );
                  const isWistiaVideo = this.checkWistiaVideo(
                    item.metadata.mvresearch_video_url[0]
                  );

                  if (isWistiaVideo) {
                    const wistiaId = this.getWistiaID(
                      item.metadata.mvresearch_video_url[0]
                    );
                    const wistiaUrl = `https://fast.wistia.net/oembed?url=http://home.wistia.com/medias/${wistiaId}?embedType=async`;

                    return this.http.get(wistiaUrl).pipe(
                      map((data: any) => {
                        item.thumbnailUrl = data.thumbnail_url;
                        item.videoID = wistiaId;
                        item.isWistia = true;
                        return item;
                      })
                    );
                  }

                  if (isYoutubeVideo) {
                    const youtubeId = this.getYoutubeID(
                      item.metadata.mvresearch_video_url[0]
                    );

                    item.thumbnailUrl = `http://img.youtube.com/vi/${youtubeId}/0.jpg`;
                    item.videoID = youtubeId;
                    item.isWistia = false;
                    return of(item);
                  }
                  return of(item);
                })
              )
            : new Observable<any[]>((subscriber) => subscriber.next([]));
        })
      )
      .pipe(
        map((responseData) => {
          const researchVideoArray: Research[] = [];

          responseData.forEach((element: any) => {
            researchVideoArray.push({
              title: element.title.rendered ? element.title.rendered : '',
              description: element.content.rendered
                ? element.content.rendered
                : '',
              videoID: element.videoID,
              isWistia: element.isWistia,
              thumbnailUrl: element.thumbnailUrl,
            });
          });
          return researchVideoArray;
        })
      );
  }

  checkYoutubeVideo(url: string) {
    if (url) {
      const p =
        /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;

      if (url.match(p)) return true;
    }
    return false;
  }

  checkWistiaVideo(url: string) {
    if (url) {
      return url.includes('wistia');
    }
    return false;
  }

  getWistiaID(url: string) {
    let videoID = '';
    if (url.includes('wistia.com')) {
      videoID = url.substring(url.lastIndexOf('/') + 1);
    }
    return videoID;
  }

  getYoutubeID(url: string) {
    let videoID = '';

    const videoRegEx = url.match(
      /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/
    );
    if (videoRegEx != null) {
      videoID = videoRegEx[1];
    }
    return videoID;
  }
}
