/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AnalystsComponent } from './analysts.component';

describe('AnalystsComponent', () => {
  let component: AnalystsComponent;
  let fixture: ComponentFixture<AnalystsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalystsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalystsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
