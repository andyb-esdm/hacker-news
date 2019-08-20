import { Component, OnInit, Input } from '@angular/core';
import { IStory } from '../models/story';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss']
})
export class StoryComponent implements OnInit {
  @Input() story: IStory;

  constructor() { }

  ngOnInit() {
  }

}
