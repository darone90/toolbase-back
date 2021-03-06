export interface LoginData {
    login: string;
    password: string;
    id?: string;
    ivkey?: string;
}

export interface Code {
    coded: string;
    iv: string
}

export interface Config {
    password: string;
    salt: string;
}