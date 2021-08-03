import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QRenderComponent } from './qrender.component';

describe('QRenderComponent', () => {
  let component: QRenderComponent;
  let fixture: ComponentFixture<QRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
