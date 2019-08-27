import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IStory } from '../models/story';
import { HackerNewsService } from '../hacker-news.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  comments$: Observable<IStory[]>;

  constructor(private route: ActivatedRoute, private service: HackerNewsService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.comments$ = this.service.comment$;

    this.service.getComments(+id);


  }

}
