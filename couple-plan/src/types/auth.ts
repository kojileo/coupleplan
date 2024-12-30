export interface LoginForm {
    email: string
    password: string
  }
  
  export interface SignUpForm extends LoginForm {
    name: string
  }

export interface Profile {
  id: string
  userId: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}