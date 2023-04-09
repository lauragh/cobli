//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');

////*FUNCTIONS *////
async function registerUser(data) { 
    return new Promise(async(resolve, reject)=> {
        console.log(data);
        try {
            await firebaseRef.createUserWithEmailAndPassword(firebaseRef.auth, data.email, data.password);
            let userUid = await getUserId();
            resolve(userUid);  
        }
        catch(err){
            reject();
            console.log("An error has occured:" + err);
        }
  
    }); 
} 

async function getUserId(){
    var user = firebaseRef.auth.currentUser.uid;
    return user
}


async function logoutUser() {
    try {
        await firebaseRef.auth.signOut();
    }
    catch(err){
        console.log("An error has occured:" + err);
    }
}

async function updatePassword(email) {
    try {
        await firebaseRef.sendPasswordResetEmail(firebaseRef.auth, email)
    }   
    catch(err){
        console.log("An error has occured:" + err);
    }
}


async function loginUserFirebase(data) {
    try{
        await firebaseRef.setPersistence(firebaseRef.auth, firebaseRef.browserSessionPersistence);
        console.log('datos',data);
        await firebaseRef.signInWithEmailAndPassword(firebaseRef.auth, data.email, data.password);
        let user = firebaseRef.auth.currentUser;
        let userToken = await user.getIdToken(true);
        let uid = user.uid;
     
        let objeto = {
            token: userToken,
            uid: uid
        }
        return objeto
    }
    catch(err){
        console.log("An error has occured:" + err);
        return null  
    }
}

const login_user = async (req, res) => {
    // console.log(req.body);
    try {
        let logged = await loginUserFirebase(req.body);

        return res.status(httpCodes.OK).json({
            token: logged.token,
            uid: logged.uid,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error en el inicio de sesión, datos incorrectos'+ err
        });
    }
};

const update_password = async (req, res) => {
        // console.log(req.body);
        try {
            await updatePassword(req.body.email);
    
            return res.status(httpCodes.OK).json({
              ok: true
            });
        }
        catch(err){
            return  res.status(httpCodes.BAD_REQUEST).json({
                ok: false,
                msg: 'Error cambiando la contraseña'+ err
            });
        }
}

module.exports = {registerUser, getUserId, logoutUser, login_user, update_password}