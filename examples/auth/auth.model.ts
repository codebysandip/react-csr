export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Geolocation {
  lat: string;
  long: string;
}

export interface Address {
  geolocation: Geolocation;
  city: string;
  street: string;
  number: number;
  zipcode: string;
}

export interface Name {
  firstname: string;
  lastname: string;
}

export interface JwtToken {
  iat?: number;
  exp?: number;
}

export interface TokenData extends JwtToken {
  address: Address;
  id: number;
  email: string;
  username: string;
  password: string;
  name: Name;
  phone: string;
  __v: number;
}
