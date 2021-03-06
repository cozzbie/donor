import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DonateComponent } from './donate.component';
import { AppModule } from '../../app.module';

describe('DonateComponent', () => {
    let component: DonateComponent;
    let fixture: ComponentFixture<DonateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [AppModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DonateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
