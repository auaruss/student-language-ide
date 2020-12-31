import { Component, OnInit, ViewChild } from '@angular/core';
import * as CodeMirror from 'codemirror';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {
  content;
  
  @ViewChild('evaluations') evaluations: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.evaluations.codeMirror.setSize("100%", "100%");
    this.evaluations.codeMirror.setValue("Hello, world.");
  }
}
