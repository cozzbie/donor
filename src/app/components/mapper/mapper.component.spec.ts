import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcgisMapperComponent } from './arcgis-mapper.component';

describe('ArcgisMapperComponent', () => {
  let component: ArcgisMapperComponent;
  let fixture: ComponentFixture<ArcgisMapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArcgisMapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArcgisMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
