import { Injectable } from '@angular/core';
import { IStory } from './models/story';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsService {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  private storyIds: number[] = [];
  private start = 0;
  private pageSize = 20;

  private topStories: BehaviorSubject<IStory[]> = new BehaviorSubject<IStory[]>(null);
  get topStories$() {
    return this.topStories.asObservable();
  }

  private comments: BehaviorSubject<IStory[]> = new BehaviorSubject<IStory[]>(null);
  get comment$() {
    return this.comments.asObservable();
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

  getStory(id: number) {
    const topStories = this.topStories.getValue();
    if (topStories !== null) {
      const story = this.topStories.getValue().find(topStory => topStory.id === id);
      if (story !== undefined) {
        return of(story);
      }
    }
    return this.http.get<IStory>(`${this.baseUrl}/item/${id}.json`);
  }

  getComments(id: number) {
    this.comments.next(null);
    const commentRequests: Observable<IStory>[] = new Array<Observable<IStory>>();
    this.http.get<IStory>(`${this.baseUrl}/item/${id}.json`).subscribe(
      response => {
        const kids = response.kids;
        kids.forEach(kid => {
          commentRequests.push(this.http.get<IStory>(`${this.baseUrl}/item/${kid}.json`));
        });
        forkJoin(commentRequests).subscribe(comments => {
          this.comments.next(comments);
        });
      }
    );
  }

}

