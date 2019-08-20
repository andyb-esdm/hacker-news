import { Injectable } from '@angular/core';
import { IStory } from './models/story';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsService {
  private topStories: BehaviorSubject<IStory[]> = new BehaviorSubject<IStory[]>(null);
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  private storyIds: number[] = [];
  private start = 0;
  private pageSize = 20;

  get topStories$() {
    return this.topStories.asObservable();
  }

  constructor(private http: HttpClient) {
    this.http.get<number[]>(`${this.baseUrl}/topstories.json`).subscribe(
      (response) => {
        this.storyIds = response;
        this.getStories(0, this.pageSize);
      });
  }

  getNext() {
    this.start += this.pageSize;
    if (this.start + this.pageSize > this.storyIds.length) {
      this.start = this.storyIds.length - this.pageSize;
    }
    this.topStories.next(null);
    this.getStories(this.start, this.start + this.pageSize);
  }

  getPrevious() {
    this.start -= this.pageSize;
    if (this.start < 0) {
      this.start = 0;
    }
    this.topStories.next(null);
    this.getStories(this.start, this.start + this.pageSize);
  }

  getStories(start: number, end: number) {
    const requestedStoryIds = this.storyIds.slice(start, end);
    const storyRequests: Observable<IStory>[] = new Array<Observable<IStory>>();
    requestedStoryIds.forEach(id => {
      storyRequests.push(this.http.get<IStory>(`${this.baseUrl}/item/${id}.json`));
    });
    forkJoin(storyRequests).subscribe(stories => {
      this.topStories.next(stories);
    });
  }
}

