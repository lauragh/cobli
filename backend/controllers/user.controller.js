//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const User = require('../entities/user');
const bcrypt = require('bcrypt');
// const { v4: uuidv4 } = require('uuid');

//Constant

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

async function getUser(userId, db) {
    let result = null;
    // console.log(userId)

    //////*Otra forma de obtener datos*////////

    // const distanceRef = await firebaseRef.ref(db, 'users/' + userId );
    // onValue(distanceRef, (snapshot) => {
    //     result = snapshot.val();
    //     console.log(result);
    // }) 

    await firebaseRef.get(
        firebaseRef.child(db, `users/${userId}`)
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

async function createUser(rawData, db) {
    try{
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(rawData.password, salt);
        // const id = uuidv4(); 
        const userDateLastAccess = new Date();
        const userDateRegistration = new Date();

        let user = new User(
            // id,
            userDateLastAccess.toLocaleString(),
            userDateRegistration.toLocaleString(),
            rawData.name,
            rawData.email,
            cpassword,
            rawData.colorBlindness,
            rawData.occupation,
        );

        let userObject = {
            // id: user.id,
            dateLastAccess: user.dateLastAccess,
            dateRegistration: user.dateRegistration,
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness,
            occupation: user.occupation,
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

async function deleteUser(userId, db) {
    let locationRef = firebaseRef.ref(db, 'users/' + userId);
    await firebaseRef.set(locationRef, null);

}

// module.exports = { getUsers, createUsers}

module.exports = function (app) {
    app.get('/users', async (req, res) => {
        const db = firebaseRef.ref(firebaseRef.getDatabase());
        // const db = firebaseRef.db;
        let user, allUsers;

        if(req.query.id !== undefined && Object.keys(req.query).length === 1){
            user = await getUser(req.query.id, db);
            console.log('usuario',user);
            res.send(user);
            res.status(user === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
        else{
            allUsers = await getUsers(db);
            // console.log(allUsers["7cd5db46-0d10-42ef-b7d1-2344f9fe8853"])
            // console.log(allUsers[Object.keys(allUsers)[0]].dateLastAccess)
            console.log(allUsers);
            res.send(allUsers);
            res.status(allUsers === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
    });

    // app.get('/users/getUser/', async (req, res) => {
    //     const db = firebaseRef.getDatabase();
    //     let user = await getUser(req.query.id, db);
    //     console.log(req.query.id);
    //     res.send();
    // });

    app.post('/users', async (req, res) => {
        const db = firebaseRef.getDatabase();
        let userCreated = await createUser(req.body, db);
        res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
        res.send();
    });

    app.delete('/users', async (req, res) => {
        const db = firebaseRef.getDatabase();
        let userDeleted = await deleteUser(req.query.id, db);

        console.log(req.query.id);
        res.send();
    })
}