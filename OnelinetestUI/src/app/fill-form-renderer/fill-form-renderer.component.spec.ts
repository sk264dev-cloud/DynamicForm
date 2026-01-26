import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillFormRendererComponent } from './fill-form-renderer.component';

describe('FillFormRendererComponent', () => {
  let component: FillFormRendererComponent;
  let fixture: ComponentFixture<FillFormRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FillFormRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillFormRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
