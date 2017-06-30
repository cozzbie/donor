import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MapperComponent } from './mapper.component';
import { AppModule } from '../../app.module';

describe('MapperComponent', () => {
    let component: MapperComponent;
    let fixture: ComponentFixture<MapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [AppModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

});
