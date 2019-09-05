import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT, API_TIMEOUT } from '../../environments/environment';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
      protected httpClient: HttpClient,
  ) {
  }

  public get(route: string, httpOptions?: any) {
    return this.request('get', route, null, httpOptions);
  }

  public post(route: string, body: any, httpOptions?: any) {
    return this.request('post', route, body, httpOptions);
  }

  protected request(method: string, route: string, body?: any, httpOptions?: any): Promise<any> {
    let request;

    switch (method) {
      case 'get':
        request = this.httpClient
            .get(`${API_ENDPOINT}/${route}`, httpOptions)
            .pipe(timeout(API_TIMEOUT));
        break;

      case 'post':
        request = this.httpClient
            .post(`${API_ENDPOINT}/${route}`, body, httpOptions)
            .pipe(timeout(API_TIMEOUT));
        break;
    }

    return new Promise((resolve, reject) => {
      request.subscribe((response) => {
            resolve(response);
          },
          () => {
            reject(new Error('There was a problem connecting to the server. Please try again.'));
          }
      );
    });
  }
}
