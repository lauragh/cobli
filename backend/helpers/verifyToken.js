//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');

const verifyToken = function(token){
  return new Promise(async (resolve, reject) => {
    let user = firebaseRef.auth.currentUser;
    // console.log('cabecera', token);

    if(user) {
      try {
        let userToken = await user.getIdToken();
        let result = checkToken(token, userToken);
        resolve(result);
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
            let result = checkToken(token, userToken);
            resolve(result);
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

function checkToken(token, userToken){
  if(token === userToken){
    console.log('Token válido');
    return true
  }
  else{
    console.log('Token inválido');
    return false
  }
}

module.exports = {verifyToken}