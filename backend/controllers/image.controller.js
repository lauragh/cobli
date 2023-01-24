
//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const Image = require('../entities/image');
const bcrypt = require('bcrypt');
// const { v4: uuidv4 } = require('uuid');


function validatePicture(picture){
    let pattern = ".+(\\.jpg|\\.png|\\.jpeg)";
    let matcher = new RegExp(pattern);
    return matcher.test(picture)
}

//Constant
async function createImage(userId, data, db) {
    try{
        // const salt = bcrypt.genSaltSync();
        // const cpassword = bcrypt.hashSync(image.password, salt);
        // const id = uuidv4(); 
        const imageDateCreation = new Date();
        console.log(userId);
        
        if(!validatePicture(data.img)){
            // return res.status(httpCodes.BAD_REQUEST).json({
            //     ok: false,
            //     msg: 'La imagen no es válida'
            // });
            throw new Error("La imagen no es válida")
        }
        else{
            let image = new Image(
                // id,
                data.img,
                data.name,
                // data.colorTags,
                data.brightness,
                data.saturation,
                data.contrast,
                imageDateCreation.toLocaleString()
            );
    
            let imageObject = {
                // id: image.id,
                img: image.img,
                name: image.name,
                // colorTags: image.colorTags,
                brightness: image.brightness,
                saturation: image.saturation,
                contrast: image.contrast,
                dateCreation: image.dateCreation,
            }

            const userRef = firebaseRef.ref(db, 'users/' + userId + '/images');
            const newImageRef = firebaseRef.push(userRef);

            // const newImageKey = firebaseRef.push(firebaseRef.child(firebaseRef.ref(firebaseRef.getDatabase), ''))
            // let locationRef = firebaseRef.ref(db, `users/${userId}`);
            await firebaseRef.set(
                newImageRef, imageObject
            );
            console.log(image)
            return true;
        }
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

// async function getImage(db) {
//     let result = null;

//     await firebaseRef.get(
//         //child we want to get information
//         console.log('key',firebaseRef.child(db, `users/${userId}`).key);

//         firebaseRef.child(db, `users/${userId}`)
//     )
//     //promise resolved
//     .then((snapshot) => {
//         if(snapshot.exists()){
//             result = snapshot.val();
//         }
//         else{
//             console.log("Not image found");
//         }
//     });

//     return result;
// }

// async function getUser(userId, db) {
//     let result = null;
//     // console.log(userId)

//     //////*Otra forma de obtener datos*////////

//     // const distanceRef = await firebaseRef.ref(db, 'users/' + userId );
//     // onValue(distanceRef, (snapshot) => {
//     //     result = snapshot.val();
//     //     console.log(result);
//     // }) 

//     await firebaseRef.get(
//         firebaseRef.child(db, `users/${userId}`)
//     )
//     .then((snapshot) => {
//         if(snapshot.exists()){
//             result = snapshot.val();
//         }
//         else{
//             console.log("Not users found");
//         }
//     });

//     return result;
// }



// async function deleteUser(userId, db) {
//     let locationRef = firebaseRef.ref(db, 'users/' + userId);
//     await firebaseRef.set(locationRef, null);

// }

// module.exports = { getUsers, createUsers}

module.exports = function (app) {
    // app.get('/users', async (req, res) => {
    //     const db = firebaseRef.ref(firebaseRef.getDatabase());
    //     // const db = firebaseRef.db;
    //     let user, allUsers;

    //     if(req.query.id !== undefined && Object.keys(req.query).length === 1){
    //         user = await getUser(req.query.id, db);
    //         console.log('usuario',user);
    //         res.send(user);
    //         res.status(user === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    //     }
    //     else{
    //         allUsers = await getUsers(db);
    //         // console.log(allUsers["7cd5db46-0d10-42ef-b7d1-2344f9fe8853"])
    //         // console.log(allUsers[Object.keys(allUsers)[0]].dateLastAccess)
    //         console.log(allUsers);
    //         res.send(allUsers);
    //         res.status(allUsers === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    //     }
    // });

    // app.get('/users/getUser/', async (req, res) => {
    //     const db = firebaseRef.getDatabase();
    //     let user = await getUser(req.query.id, db);
    //     console.log(req.query.id);
    //     res.send();
    // });

    app.post('/users/-NMZ_ksPwOZJD5TGH0FO', async (req, res) => {
        const db = firebaseRef.getDatabase();
        let userCreated = await createImage(req.query.userId, req.body, db);
        res.status(userCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
        res.send();
    });

    // app.delete('/users', async (req, res) => {
    //     const db = firebaseRef.getDatabase();
    //     let userDeleted = await deleteUser(req.query.id, db);

    //     console.log(req.query.id);
    //     res.send();
    // })
}