import { TestBed, async, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DonorService } from "./donor";


describe("Providers", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DonorService]
        });
    });

    it("should create a donor service", inject([DonorService], donorSvc => {
        expect(donorSvc).toBeTruthy();
    }));
});
