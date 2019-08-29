import { Injectable } from '@angular/core';
import { IStory } from './models/story';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsService {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  private topStoryIds: number[] = [];
  private start = 0;
  private pageSize = 20;

  private stories: BehaviorSubject<Map<number, IStory>> = new BehaviorSubject<Map<number, IStory>>(new Map<number, IStory>());

  private topStories: BehaviorSubject<IStory[]> = new BehaviorSubject<IStory[]>(null);
  get topStories$() {
    return this.topStories.asObservable();
  }

  private comments: BehaviorSubject<IStory[]> = new BehaviorSubject<IStory[]>(null);
  get comment$() {
    return this.comments.asObservable();
  }

  constructor(private http: HttpClient) {
    this.getTopStoryIds();
  }

  private getTopStoryIds() {
    this.http.get<number[]>(`${this.baseUrl}/topstories.json`).subscribe(
      (response) => {
        this.topStoryIds = response;
        this.getTopStories(0, this.pageSize);
      });
  }

  getNext() {
    this.start += this.pageSize;
    if (this.start + this.pageSize > this.topStoryIds.length) {
      this.start = this.topStoryIds.length - this.pageSize;
    }
    this.topStories.next(null);
    this.getTopStories(this.start, this.start + this.pageSize);
  }

  getPrevious() {
    this.start -= this.pageSize;
    if (this.start < 0) {
      this.start = 0;
    }
    this.topStories.next(null);
    this.getTopStories(this.start, this.start + this.pageSize);
  }

  getTopStories(start: number, end: number) {
    const requestedStoryIds = this.topStoryIds.slice(start, end);
    const storyRequests: Observable<IStory>[] = new Array<Observable<IStory>>();
    requestedStoryIds.forEach(id => {
      storyRequests.push(this.getStory(id));
    });
    forkJoin(storyRequests).subscribe(stories => {
      this.topStories.next(stories);
    });
  }

  getStory(id: number) {
    return this.getItem(id);
  }

  getItem(id: number) {
    const stories = this.stories.getValue();
    const story = stories.get(id);
    if (story === undefined) {
      return this.http.get<IStory>(`${this.baseUrl}/item/${id}.json`).pipe(
        tap(s => {
          stories.set(s.id, s);
          this.stories.next(stories);
        }
        ));
    } else {
      console.log('defined');
      return of(story);
    }
  }

  getComments(id: number) {
    if (id === null) {
      return null;
    }
    this.comments.next(null);
    const commentRequests: Observable<IStory>[] = new Array<Observable<IStory>>();
    this.http.get<IStory>(`${this.baseUrl}/item/${id}.json`).subscribe(
      response => {
        const kids = response.kids;
        if (kids) {
          kids.forEach(kid => {
            commentRequests.push(this.getItem(kid));
          });
          forkJoin(commentRequests).subscribe(comments => {
            this.comments.next(comments);
          });
        } else {
          this.comments.next([]);
        }
      }
    );
  }

}

