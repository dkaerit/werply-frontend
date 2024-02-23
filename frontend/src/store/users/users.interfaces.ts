export interface UserState {
    _id:string;
    avatar: string;
    nickname: string;
    username: string;
    // Otras propiedades
}

export interface RootState {
    user: UserState;
    // Otros estados si los tiene
}