import { Component, OnInit, ViewChild } from '@angular/core';
import * as CodeMirror from 'codemirror';


@Component({
  selector: 'app-definitions',
  templateUrl: './definitions.component.html',
  styleUrls: ['./definitions.component.scss']
})
export class DefinitionsComponent implements OnInit {
  content;

  @ViewChild('editor') editor: any;
  
  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.editor.codeMirror.setSize("100%", "100%");
    this.editor.codeMirror.setValue("Hello, world.");
  }
}
