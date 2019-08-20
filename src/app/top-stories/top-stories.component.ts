import { Component, OnInit } from '@angular/core';
import { HackerNewsService } from '../hacker-news.service';
import { Observable } from 'rxjs';
import { IStory } from '../models/story';

@Component({
  selector: 'app-top-stories',
  templateUrl: './top-stories.component.html',
  styleUrls: ['./top-stories.component.scss']
})
export class TopStoriesComponent implements OnInit {
  stories$: Observable<IStory[]>;

  constructor(private service: HackerNewsService) { }

  ngOnInit() {
    this.stories$ = this.service.topStories$;
  }

  onNext() {
    this.service.getNext();
  }

  onPrevious() {
    this.service.getPrevious();
  }

}
