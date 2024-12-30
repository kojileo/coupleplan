export interface LoginForm {
    email: string
    password: string
  }
  
  export interface SignUpForm extends LoginForm {
    name: string
  }