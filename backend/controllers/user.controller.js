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
        console.log('recibo',data);
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(data.password, salt);
        const userDateLastAccess = new Date();
        const userDateRegistration = new Date();

        let user = new User(
            data.userName,
            data.email,
            cpassword,
            data.colorBlindness,
            data.occupation,
            userDateLastAccess.toLocaleString(),
            userDateRegistration.toLocaleString(),
            0,
            null
        );

        let userObject = {
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness ? user.colorBlindness : null,
            occupation: user.occupation ? user.colorBlindness : null,
            dateLastAccess: user.dateLastAccess,
            dateRegistration: user.dateRegistration,
            numImages: user.numImages,
            images: user.images,
        }


        let userData = { 
            email: user.email,
            password: data.password
        }

        let userUid;
        try {
            userUid = await auth.registerUser(userData);
            console.log(userUid);
            let locationRef = firebaseRef.ref(db, 'users/' + userUid);
            firebaseRef.set(locationRef, userObject);

            return true;
        }
        catch (err) {
            console.log('fallo', err);
            return false;
        }

        
    }
    catch(err){
        console.log("An error has occured in createUser:" + err);
        return false;
    }
}

//Get all users

async function getUsers(db) {
    let result = null;
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

async function updateNumImages(userId, action, db){
    try {
        let locationRef = firebaseRef.ref(db, `users/${userId}`);
    
        if(action === 'add'){
            await firebaseRef.update(locationRef, {
                numImages: firebaseRef.increment(1)
            });
        }
        else if(action === 'remove') {
            await firebaseRef.update(locationRef, {
                numImages: firebaseRef.increment(-1)
            });
        }
    
        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

//Modify one user in particular
async function updateUser(userId, data, db) {
    try{
        let user = new User(
            data.name,
            data.email,
            data.password,
            data.colorBlindness,
            data.occupation,
            data.dateRegistration,
            data.dateLastAccess,
            data.numImages,
            data.images
        );

        let userObject = {
            name: user.name,
            email: user.email,
            password: user.password,
            colorBlindness: user.colorBlindness,
            occupation: user.occupation,
            dateRegistration: user.dateRegistration,
            dateLastAccess: user.dateLastAccess,
            numImages: user.images,
            images: user.images
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
        if(userCreated){
            return res.json({
                ok: true,
                msg: 'Usuario creado',
                user: userCreated,
            });
        }
        else {
            return  res.status(httpCodes.BAD_REQUEST).json({
                ok: false,
                msg: 'Error creando usuario'
            });
        }

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
        console.log('miro esto',user);
        user.images = [];
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
    // console.log(req.params);

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }

    try {
        let allUsers = await getUsers(db);
        // console.log(allUsers);
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

const update_numImages = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }

    try {
        let numImages = await updateNumImages(req.params.userId, req.body.action, db);

        console.log(numImages);
        return res.json({
            ok: true,
            msg: 'Número de imágenes actualizado',
            images: numImages,
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error actualizando número de imágenes'+ err
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

module.exports = {create_user, get_user, get_users, update_user, delete_user, update_numImages}