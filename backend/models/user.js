class User {
    constructor(
        name,
        email,
        password,
        colorBlindness,
        occupation,
        dateRegistration,
        dateLastAccess,
        numImages,
        images
    ){
        this.name = name;
        this.email = email;
        this.password = password;
        this.colorBlindness = colorBlindness;
        this.occupation = occupation;
        this.dateRegistration = dateRegistration;
        this.dateLastAccess = dateLastAccess;
        this.numImages = numImages;
        this.images = images;
    }
}

module.exports = User