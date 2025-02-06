// types.ts

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  photo: File | null;
}

export interface FunProfileData {
  nickname: string;
  favoriteSpot: string;
  favoriteSubject: string;
  myGang: string;
  bestMemory: string;
}

export interface CompleteSignUpData extends SignUpData, FunProfileData {}
