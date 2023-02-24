//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../controllers/auth.controller');

////* CRUD FUNCTIONS *////


//Create a user
async function createUser(data, db) {
    try{
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(data.password, salt);
        const userDateLastAccess = new Date();
        const userDateRegistration = new Date();
        let password = data.password;

        let user = new User(
            data.name,
            data.email,
            cpassword,
            data.colorBlindness,
            data.occupation,
            userDateLastAccess.toLocaleString(),
            userDateRegistration.toLocaleString(),
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
            images: user.images,
        }


        let userData = { 
            email: user.email,
            password: data.password
        }

        let userUid;
        userUid = await auth.registerUser(userData);

        let locationRef = firebaseRef.ref(db, 'users/' + userUid);
        firebaseRef.set(locationRef, userObject);

        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

//Get all users

async function getUsers(db) {
    let result = null;

    let userData = { 
        email: 'garcia.hdez.laura@gmail.com',
        password: 'cobli123'
    }

    // let userData = { 
    //     email: 'taras@gmail.com',
    //     password: 'hola123.'
    // }
    let loginUser = await auth.loginUser(userData);
    
    if(loginUser !== false){
        await firebaseRef.get(
            firebaseRef.child(db, "users")
        )
        .then((snapshot) => {
            if(snapshot.exists()){
                result = snapshot.val();
            }
            else{
                console.log("Not users found");
            }
        });
    
    }
    return result;
}

//Get one user
async function getUser(userId, db) {
    let result = null;
    let loginUser = await auth.getUserId();
    console.log(loginUser);

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


//Modify one image in particular
async function updateUser(userId, data, db) {
    try{
        const userDateLastAccess = new Date();
        let user = new User(
            data.name,
            data.email,
            data.password,
            data.colorBlindness,
            data.occupation,
            data.dateRegistration,
            userDateLastAccess.toLocaleString(),
            null
        );

        let userObject = {
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness,
            occupation: user.occupation,
            dateRegistration: user.dateRegistration,
            dateLastAccess: user.dateLastAccess,
        }

        let locationRef = firebaseRef.ref(db, `users/${userId}`);
        await firebaseRef.update(locationRef, userObject);

        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

async function deleteUser(userId, db) {
    let locationRef = firebaseRef.ref(db, `users/${userId}`);
    await firebaseRef.set(locationRef, null);

}

const create_user = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(req.body !== undefined){
        let userCreated = await createUser(req.body, db);
        console.log(userCreated);
        res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
        res.send();
    }
};

const get_user = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());
    let user, allUsers;
    if(req.params.userId !== undefined && Object.keys(req.params).length === 1){
        user = await getUser(req.params.userId, db);
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
};

const update_user = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(req.params.userId !== undefined && Object.keys(req.params).length === 1 && req.body !== undefined){
        userModified = await updateUser(req.params.userId, req.body, db);
        console.log('userModified',userModified);
        res.send(userModified);
        res.status(userModified === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    }
};

const delete_user = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(req.params.userId !== undefined && Object.keys(req.params).length === 1){
        let userDeleted = await deleteUser(req.params.userId, db);
        res.send();
        res.status(userDeleted === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    }
};

module.exports = {create_user, get_user, update_user, delete_user}