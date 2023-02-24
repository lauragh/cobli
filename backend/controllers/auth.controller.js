//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');

////*FUNCTIONS *////
async function registerUser(data) { 
    return new Promise(async(resolve, reject)=> {
        console.log(data);
        await firebaseRef.createUserWithEmailAndPassword(firebaseRef.auth, data.email, data.password)
        let userUid = await getUserId();
        resolve(userUid);    
    }); 
} 

async function getUserId(){
    var user = firebaseRef.auth.currentUser.uid;
    console.log('usuario', user);
    return user
}

async function loginUser(data) {
    try{
        await firebaseRef.setPersistence(firebaseRef.auth, firebaseRef.browserSessionPersistence);
        console.log(data);
        await firebaseRef.signInWithEmailAndPassword(firebaseRef.auth, data.email, data.password);
       
        return true
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false  
    }
}

async function logoutUser() {
    try {
        await firebaseRef.auth.signOut();
    }
    catch(err){
        console.log("An error has occured:" + err);
    }
}

async function verifyToken(token){
    firebaseRef.auth.onAuthStateChanged(function(user) {
        if (user) {
          if(token === user.getIdToken()){
            return true;
          }
          else{
            return false;
          }
        }
    });
}


const login_user = async (req, res) => {
    // console.log(req.body);

    if(req.body !== undefined){
        let logged = await loginUser(req.body);

        if(logged){
            firebaseRef.auth.onAuthStateChanged(async function(user) {
                if (user) {
                    let userToken = await user.getIdToken(true);
                    let uid = user.uid;
                    // console.log('hay token', userToken);
                    // console.log(uid);
                    return res.status(httpCodes.OK).json({
                        token: userToken,
                        uid: uid,
                    });
                } else {
                    console.log('Error en el inicio de sesión, datos incorrectos');
                }
            });
            
        }

    }
};

const register_user = async (req, res) => {
    if(req.body !== undefined){
        let userCreated = await registerUser(req.body);
        console.log(userCreated);
        res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.OK);
        res.send();
    }
};

module.exports = {registerUser, getUserId, logoutUser, login_user, loginUser}