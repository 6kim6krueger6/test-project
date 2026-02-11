export interface SignUpDto {
    id: string;
    password: string;
}

export interface SignInDto extends SignUpDto {}