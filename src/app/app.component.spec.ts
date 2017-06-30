import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

declare var io: any;

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>, component: AppComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [AppModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        //fixture.detectChanges();
    });

    it('should create the app', done => {
        expect(component).toBeTruthy();
        done();
    });

    it('linked variable init should be false', done => {
        expect(component.linked).toEqual(false);
        done();
    });
});
