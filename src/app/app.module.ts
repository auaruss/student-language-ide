import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefinitionsComponent } from './definitions/definitions.component';
import { EvaluationsComponent } from './evaluations/evaluations.component';
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [
    AppComponent,
    DefinitionsComponent,
    EvaluationsComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CodemirrorModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
