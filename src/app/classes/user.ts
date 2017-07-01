export class User {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    blood_group: string;
    link: string;
    coords: any

    constructor(value: Object = {}){
        Object.assign(this, value);
    }
}
