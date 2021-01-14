import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import * as CodeMirror from 'codemirror';


@Component({
  selector: 'app-definitions',
  templateUrl: './definitions.component.html',
  styleUrls: ['./definitions.component.scss']
})
export class DefinitionsComponent implements OnInit {
  @Output() redirect: EventEmitter<any> = new EventEmitter();
  @ViewChild('editor') editor: any;

  content;
  
  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let rd = this.redirect;
    this.editor.codeMirror.setSize("100%", "100%");
    this.editor.codeMirror.on('change', (cm, change) => {
      this.handleChange(rd, cm, change)
    });
  }
  
  handleChange(rd, cm, change): void {
    rd.emit(this.content);
  }
}
