//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');

////*FUNCTIONS *////
async function registerUser(data) { 
    return new Promise(async(resolve, reject)=> {
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

        await firebaseRef.signInWithEmailAndPassword(firebaseRef.auth, data.email, data.password);
        let userToken = await firebaseRef.auth.currentUser.getIdToken(true);


        // .then(user => {
        //     // Get the user's ID token as it is needed to exchange for a session cookie.
        //     return user.getIdToken().then(idToken => {
        //       // Session login endpoint is queried and the session cookie is set.
        //       // CSRF protection should be taken into account.
        //       // ...
        //       const csrfToken = getCookie('csrfToken')
        //       return postIdTokenToSessionLogin('/login', idToken, csrfToken);
        //     });
        // });
        //   }).then(() => {
        //     // A page redirect would suffice as the persistence is set to NONE.
        //     return firebase.auth().signOut();
        //   }).then(() => {
        //     window.location.assign('/profile');
        //   });

        // await firebaseRef.signInWithEmailAndPassword(firebaseRef.auth, data.email, data.password);
        // await getUserId();
        return userToken
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false  
    }
}

async function logoutUser(email, password) {
    firebaseRef.signInWithEmailAndPassword(firebaseRef.auth, email, password);
}

async function userState(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          var uid = user.uid;
          console.log("User UID: ", uid);
        }
      });
}

const login_user = async (req, res) => {
    if(req.body !== undefined){
        let userCreated = await loginUser(req.body);
        console.log(userCreated);
        res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.OK);
        res.send();
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

module.exports = {registerUser, getUserId, logoutUser, login_user}