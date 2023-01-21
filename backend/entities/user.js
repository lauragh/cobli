class User {
    constructor(
        dateLastAccess,
        dateRegistration,
        name,
        email,
        password,
        colorBlindness,
        occupation
    ){
        this.dateLastAccess = dateLastAccess;
        this.dateRegistration = dateRegistration;
        this.name = name;
        this.email = email;
        this.password = password;
        this.colorBlindness = colorBlindness;
        this.occupation = occupation;
    }
}

module.exports = User