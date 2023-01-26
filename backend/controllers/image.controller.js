
//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const Image = require('../entities/image');

const usuario = "-NMcYHxLY0F-yfnPx7b_";



//validar imagen
function validatePicture(picture){
    let pattern = ".+(\\.jpg|\\.png|\\.jpeg)";
    let matcher = new RegExp(pattern);
    return matcher.test(picture)
}

////* CRUD FUNCTIONS *////

//Create a image 
async function createImage(userId, data, db) {
    try{
        const imageDateCreation = new Date();
        const imageDateUpdation = new Date();

        console.log(userId);
        
        if(!validatePicture(data.img)){
            throw new Error("The image is not valid")
        }
        else{
            let image = new Image(
                data.img,
                data.name,
                data.brightness,
                data.saturation,
                data.contrast,
                imageDateCreation.toLocaleString(),
                imageDateUpdation.toLocaleString(),
                null

            );
    
            let imageObject = {
                img: image.img,
                name: image.name,
                brightness: image.brightness,
                saturation: image.saturation,
                contrast: image.contrast,
                dateCreation: image.dateCreation,
                dateUpdation: image.dateUpdation,
                colorTags: image.colorTags
            }

            const userRef = firebaseRef.ref(db, 'users/' + userId + '/images');
            const newImageRef = firebaseRef.push(userRef);

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

//Get all the images from one user
async function getImages(db) {
    let result = null;
    await firebaseRef.get(
        firebaseRef.child(db, `users/${usuario}/images/`)
    )
    .then((snapshot) => {
        if(snapshot.exists()){
            result = snapshot.val();
        }
        else{
            console.log("Not images found");
        }
    });

    return result;
}

//Get one image in particular from one user
async function getImage(imageId, userId, db) {
    let result = null;
    console.log(imageId);
    await firebaseRef.get(
        // console.log('key',firebaseRef.child(db, `users/${userId}`).key);
        firebaseRef.child(db, `users/${userId}/images/${imageId}`)
    )
    .then((snapshot) => {
        if(snapshot.exists()){
            result = snapshot.val();
        }
        else{
            console.log("Not image found");
        }
    });

    return result;
}

//Modify one image in particular
async function updateImage(imageId, data, db) {
    try{
        const imageUpdated = new Date();

        if(!validatePicture(data.img)){
            throw new Error("La imagen no es válida")
        }
        else{
            let image = new Image(
                data.img,
                data.name,
                data.brightness,
                data.saturation,
                data.contrast,
                data.dateCreation,
                imageUpdated.toLocaleString(),
                null,
            );
    
            let imageObject = {
                img: image.img,
                name: image.name,
                brightness: image.brightness,
                saturation: image.saturation,
                contrast: image.contrast,
                dateCreation: image.dateCreation,
                dateUpdation: image.dateUpdation,
            }

            let locationRef = firebaseRef.ref(db, `users/${usuario}/images/${imageId}`);
            await firebaseRef.update(locationRef, imageObject);

            return true;
        }
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

//Delete image
async function deleteImage(imageId, db) {
    let locationRef = firebaseRef.ref(db, `users/${usuario}/images/${imageId}`);
    await firebaseRef.set(locationRef, null);

}


const create_image = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(req.params.userId !== undefined && Object.keys(req.params).length === 1 && req.body !== undefined){
        let imageCreated = await createImage(req.params.userId, req.body, db);
        console.log(imageCreated);
        res.status(imageCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
        res.send();
    }
};

const get_image = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());
    let image, allImages;
    console.log(req.params);
    if(req.params.imageId !== undefined  && req.params.userId !== undefined && Object.keys(req.params).length === 2){
        image = await getImage(req.params.imageId, req.params.userId, db);
        console.log('image',image);
        res.send(image);
        res.status(image === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    }
    else{
        allImages = await getImages(db);
        // console.log(allImages["-NMZgK2YczaIQjnysRJF"]);
        // console.log(allImages[Object.keys(allImages)[0]].name);
        console.log('imagenes',allImages);
        res.send(allImages);
        res.status(allImages === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    }
};

// //cambiar la ruta por req.params.user y no pasársela por parámetro en createImage

const update_image = async (req, res) => {
    const db = firebaseRef.getDatabase();
    console.log(req.params.imageId);
    console.log(req.body);
    if(req.params.imageId !== undefined && Object.keys(req.params).length === 1 && req.body !== undefined){
        imageUpdated = await updateImage(req.params.imageId, req.body, db);
        console.log('image',imageUpdated);
        res.send(imageUpdated);
        res.status(imageUpdated === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    }
};

const delete_image = async (req, res) => {
    const db = firebaseRef.getDatabase();
    if(req.params.imageId !== undefined && Object.keys(req.params).length === 1){
        let imageDeleted = await deleteImage(req.params.imageId, db);
        res.send();
        res.status(imageDeleted === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    }
};

module.exports = {create_image, get_image, update_image, delete_image}