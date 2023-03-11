export class ImageUser {
  constructor(
      public img: string,
      public name: string,
      public brightness: string,
      public saturation: string,
      public contrast: string,
      public dateCreation: string,
      public dateUpdating: string,
      public colorTags?: any[],
  ){}
}
