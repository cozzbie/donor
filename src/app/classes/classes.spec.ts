import { User } from "./user";

describe("Classes", () => {

    describe("User class", () => {
        it("should create and instance of a class", done => {
            expect(new User()).toBeTruthy();
            done();
        });
    });
    
});
