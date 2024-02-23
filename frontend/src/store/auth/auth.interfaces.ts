export interface AuthState {
}

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface EndpointWithPayload {
    endpoint: string,
    payload: LoginPayload
}

export interface RegistrationData {
    avatar: string;
    email: string;
    nickname: string;
    username: string;
    passwd: string;
}

export interface UserData {
    _id: string;
    avatar: string;
    email: string;
    nickname: string;
    username: string;
}