import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopStoriesComponent } from './top-stories/top-stories.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CommentsComponent } from './comments/comments.component';


const routes: Routes = [
  { path: '', redirectTo: '/top-stories', pathMatch: 'full' },
  { path: 'top-stories', component: TopStoriesComponent},
  { path: 'story/:id', component: CommentsComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
