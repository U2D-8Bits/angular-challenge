export interface UserModel {
    id:       number;
    gender:   string;
    role:     string;
    name:     Name;
    location: Location;
    email:    string;
    username: string;
    password: string;
    phone:    string;
    cell:     string;
    picture:  Picture;
}

export interface Location {
    city:     string;
    state:    string;
    country:  string;
    postcode: number;
}

export interface Name {
    first: string;
    last:  string;
}

export interface Picture {
    large: string;
}
