export class User {
  constructor(
      public name: string,
      public email: string,
      public password: string,
      public colorBlindness: string,
      public occupation: string,
      public dateRegistration: string,
      public images: any[]
  ){
  }
}
