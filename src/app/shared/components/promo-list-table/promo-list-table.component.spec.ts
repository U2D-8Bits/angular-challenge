/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PromoListTableComponent } from './promo-list-table.component';

describe('PromoListTableComponent', () => {
  let component: PromoListTableComponent;
  let fixture: ComponentFixture<PromoListTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromoListTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
