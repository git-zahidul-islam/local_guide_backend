export type ILoginUser = {
  email: string;
  password: string;
};

export type ILoginUserResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export type IRegisterUser = {
  name: string;
  email: string;
  password: string;
  role: 'TOURIST' | 'GUIDE';
};