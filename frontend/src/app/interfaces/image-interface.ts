export class ImageUser {
  constructor(
      public img: string,
      public name: string,
      public brightness: number,
      public saturation: number,
      public contrast: number,
      public dateCreation: string,
      public dateUpdating: string,
      public colorTags?: any[],
  ){}
}
