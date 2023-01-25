//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const User = require('../entities/user');
const bcrypt = require('bcrypt');

const usuario = "-NMcYHxLY0F-yfnPx7b_";

////* CRUD FUNCTIONS *////


//Create a user
async function createUser(data, db) {
    try{
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(data.password, salt);
        const userDateLastAccess = new Date();
        const userDateRegistration = new Date();

        let user = new User(
            // id,
            userDateLastAccess.toLocaleString(),
            userDateRegistration.toLocaleString(),
            data.name,
            data.email,
            cpassword,
            data.colorBlindness,
            data.occupation,
            null
        );

        let userObject = {
            dateLastAccess: user.dateLastAccess,
            dateRegistration: user.dateRegistration,
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness,
            occupation: user.occupation,
            images: user.images,
        }

        const userRef = firebaseRef.ref(db, 'users/');
        const newUserRef = firebaseRef.push(userRef);
        await firebaseRef.set(
            newUserRef, userObject
        );
        console.log(user)
        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}


async function getUsers(db) {
    let result = null;

    await firebaseRef.get(
        //child we want to get information
        firebaseRef.child(db, "users")
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

async function getUser(db) {
    let result = null;
    //////*Otra forma de obtener datos*////////

    // const distanceRef = await firebaseRef.ref(db, 'users/' + userId );
    // onValue(distanceRef, (snapshot) => {
    //     result = snapshot.val();
    //     console.log(result);
    // }) 

    await firebaseRef.get(
        firebaseRef.child(db, `users/${usuario}`)
    )
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


//Modify one image in particular
async function updateUser(data, db) {
    try{
        const userDateLastAccess = new Date();
        let user = new User(
            data.dateRegistration,
            data.name,
            data.email,
            data.password,
            data.colorBlindness,
            data.occupation,
            userDateLastAccess.toLocaleString(),
            null
        );

        let userObject = {
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness,
            occupation: user.occupation,
            dateLastAccess: user.dateLastAccess,
            dateRegistration: user.dateRegistration,
        }

        let locationRef = firebaseRef.ref(db, `users/${usuario}`);
        await firebaseRef.update(locationRef, userObject);

        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

async function deleteUser(db) {
    let locationRef = firebaseRef.ref(db, `users/${usuario}`);
    await firebaseRef.set(locationRef, null);

}

// module.exports = { getUsers, createUsers}

module.exports = function (app) {
    app.post('/users', async (req, res) => {
        const db = firebaseRef.getDatabase();

        if(req.body !== undefined){
            let userCreated = await createUser(req.body, db);
            console.log(userCreated);
            res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
            res.send();
        }
    });

    app.get('/users', async (req, res) => {
        const db = firebaseRef.ref(firebaseRef.getDatabase());
        let user, allUsers;

        if(req.query.userId !== undefined && Object.keys(req.query).length === 1){
            user = await getUser(req.query.userId, db);
            console.log('usuario',user);
            res.send(user);
            res.status(user === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
        else{
            allUsers = await getUsers(db);
            // console.log(allUsers["7cd5db46-0d10-42ef-b7d1-2344f9fe8853"])
            // console.log(allUsers[Object.keys(allUsers)[0]].dateLastAccess)
            console.log('usuarios',allUsers);
            res.send(allUsers);
            res.status(allUsers === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
    });

    app.put('/users/', async (req, res) => {
        const db = firebaseRef.getDatabase();
        console.log(req.query.userId);
        console.log(req.body);
        if(req.query.userId !== undefined && Object.keys(req.query).length === 1 && req.body !== undefined){
            userModified = await updateUser(req.body, db);
            console.log('userModified',userModified);
            res.send(userModified);
            res.status(userModified === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
    });

    app.delete('/users', async (req, res) => {
        const db = firebaseRef.getDatabase();
        let userDeleted = await deleteUser(req.query.userId, db);
        res.send();
    })
}