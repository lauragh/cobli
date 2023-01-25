class User {
    constructor(
        name,
        email,
        password,
        colorBlindness,
        occupation,
        dateLastAccess,
        dateRegistration,
        images
    ){
        this.name = name;
        this.email = email;
        this.password = password;
        this.colorBlindness = colorBlindness;
        this.occupation = occupation;
        this.dateLastAccess = dateLastAccess;
        this.dateRegistration = dateRegistration;
        this.images = images;
    }
}

module.exports = User