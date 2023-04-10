//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');

const verifyToken = function(){
  return new Promise(async (resolve, reject) => {
    let user = firebaseRef.auth.currentUser;
    // console.log('cabecera', token);

    if(user) {
      try {
        let userToken = await user.getIdToken();
        if(userToken){
          resolve(true);
        }
      } catch(error) {
        console.log('Error al obtener el token del usuario:', error);
        reject(error);
      }
    }
    else {
      firebaseRef.auth.onAuthStateChanged(async function(user) {
        if (user) {
          try {
            let userToken = await user.getIdToken();
            if(userToken){
              resolve(true);
            }
          } catch(error) {
            console.log('Error al obtener el token del usuario:', error);
            reject(error);
          }
        }
        else {
          resolve(false);
        }
      });
    }
  });
}

module.exports = {verifyToken}