//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const User = require('../entities/user');
const bcrypt = require('bcrypt');

//Constant

async function getUsers(db) {
    let result = null;

    await firebaseRef.databaseFunctions.get(
        //child we want to get information
        firebaseRef.databaseFunctions.child(db, "users")
    )
    //promise resolved
    .then((snapshot) => {
        if(snapshot.exists()){
            result = snapshot.val();
        }
        else{
            console.log("Not users found");
        }
    });

    return result;
}

async function createUser(rawData, db) {
    try{
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(rawData.password, salt);

        let user = new User(  
            rawData.dateLastAccess,
            rawData.dateRegistration,
            rawData.name,
            rawData.email,
            cpassword,
            rawData.colorBlindness,
            rawData.occupation
        );

        let userObject = {
            dateLastAccess: user.dateLastAccess,
            dateRegistration: user.dateRegistration,
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness,
            occupation: user.occupation
        }

        let locationRef = firebaseRef.ref(db, 'users/' + user.name);

        await firebaseRef.databaseFunctions.set(
            locationRef, userObject
        );
        console.log(user)
        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

// module.exports = { getUsers, createUsers}

module.exports = function (app) {
    //app.get(process.env.BASE_PATH + "/getAllUsers", async (req, res) => {
    app.get('/users', async (req, res) => {
        const db = firebaseRef.ref(firebaseRef.getDatabase());
        let allUsers = await getUsers(db);
        console.log(allUsers);
        res.send(allUsers);
        res.status(allUsers === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    });

    app.post('/users', async (req, res) => {
        const db = firebaseRef.getDatabase();
        let userCreated = await createUser(req.body, db);
        res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
        res.send(userCreated);
        // res.json({
        //     ok: true,
        //     msg: 'Petición crearUsuario satisfactoria',
        // });
    });
}