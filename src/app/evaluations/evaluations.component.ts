import { Component, OnInit, ViewChild, Input } from '@angular/core';
import * as CodeMirror from 'codemirror';
import { print } from '../../evaluator/print';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {
  content;
  @ViewChild('evaluations') evaluations: any;
  @Input() data:any;
  
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.evaluations.codeMirror.setSize("100%", "100%");
  }

  ngOnChanges(): void {
    this.evaluations.codeMirror.setValue(print(this.data));
  }
}
