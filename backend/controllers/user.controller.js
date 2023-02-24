//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../controllers/auth.controller');
const { verifyToken } = require('../helpers/verifyToken');

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

    // let userData = { 
    //     email: 'garcia.hdez.laura@gmail.com',
    //     password: 'cobli123'
    // }

    // let userData = { 
    //     email: 'taras@gmail.com',
    //     password: 'hola123.'
    // }
    // let loginUser = await auth.loginUser(userData);
    
    // if(loginUser !== false){
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
    
    // }
    return result;
}

//Get one user
async function getUser(userId, db) {
    let result = null;

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
    try{
        let locationRef = firebaseRef.ref(db, `users/${userId}`);
        await firebaseRef.set(locationRef, null);
        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

const create_user = async (req, res) => {
    const db = firebaseRef.getDatabase();

    try {
        let userCreated = await createUser(req.body, db);
        console.log(userCreated);
        return res.json({
            ok: true,
            msg: 'Usuario creado',
            user: userCreated,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error creando usuario '+ err
        });
    }
};

const get_user = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());
    // console.log(req.params);

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }

    try {
        let user = await getUser(req.params.userId, db);
        console.log(user);
        return res.json({
            ok: true,
            msg: 'Usuario obtenido',
            user: user,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error obteniendo usuario'+ err
        });
    }
};

const get_users = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());
    console.log(req.params);

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }

    try {
        let allUsers = await getUsers(db);
        console.log(allUsers);
        return res.json({
            ok: true,
            msg: 'Usuarios obtenidos',
            images: allUsers,
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error obteniendo usuarios'+ err
        });
    }
}

const update_user = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }

    try {
        let userModified = await updateUser(req.params.userId, req.body, db);

        console.log(userModified);
        return res.json({
            ok: true,
            msg: 'Usuario actualizado',
            images: userModified,
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error actualizando usuario'+ err
        });
    }
};

const delete_user = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }

    try {
        let userDeleted = await deleteUser(req.params.userId, db);

        console.log(userDeleted);

        if(userDeleted === false) {
            return res.status(401).send("Sin autorización");
        }

        return res.json({
            ok: true,
            msg: 'Usuario eliminado',
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error eliminando usuario'+ err
        });
    }
};

module.exports = {create_user, get_user, get_users, update_user, delete_user}