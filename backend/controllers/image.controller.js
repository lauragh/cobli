
//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const Image = require('../models/image');
const { verifyToken } = require('../helpers/verifyToken');

//Convert image to base64
function bf2base64(file) {
    // console.log(file.toString('base64'))
    return file.toString('base64')
}

////* CRUD FUNCTIONS *////

//Create a image 
async function createImage(userId, data, db) {
    try{
        const imageDateCreation = new Date();
        const imageDateUpdating = new Date();
        
        let image = new Image(
            data.img,
            data.name,
            data.brightness,
            data.saturation,
            data.contrast,
            imageDateCreation.toLocaleString(),
            imageDateUpdating.toLocaleString(),
            data.colorTags,
        );

        let imageObject = {
            img: image.img,
            name: image.name,
            brightness: image.brightness,
            saturation: image.saturation,
            contrast: image.contrast,
            dateCreation: image.dateCreation,
            dateUpdating: image.dateUpdating,
            colorTags: image.colorTags
        }

        const userRef = firebaseRef.ref(db, 'users/' + userId + '/images');
        const newImageRef = firebaseRef.push(userRef);

        await firebaseRef.set(
            newImageRef, imageObject
        );
        return [imageObject, newImageRef.key];
    }
    catch(err){
        console.log("An error has occured:" + err);
        return null;
    }
}

//Get all the images from one user
async function getImages(userId, db) {
    let result = null;
    await firebaseRef.get(
        firebaseRef.child(db, `users/${userId}/images/`)
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
    // console.log(imageId);
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
async function updateImage(userId, imageId, data, db) {
    try{
        const imageUpdated = new Date();

        let image = new Image(
            data.img,
            data.name,
            data.brightness,
            data.saturation,
            data.contrast,
            data.dateCreation,
            imageUpdated.toLocaleString(),
            data.colorTags,
        );

        let imageObject = {
            img: image.img,
            name: image.name,
            brightness: image.brightness,
            saturation: image.saturation,
            contrast: image.contrast,
            dateCreation: image.dateCreation,
            dateUpdating: image.dateUpdating,
            colorTags: image.colorTags
        }

        let locationRef = firebaseRef.ref(db, `users/${userId}/images/${imageId}`);
        await firebaseRef.update(locationRef, imageObject);

        return imageObject;
        
    }
    catch(err){
        console.log("An error has occured:" + err);
        return null;
    }
}

//Delete image
async function deleteImage(userId, imageId, db) {
    try{
        let locationRef = firebaseRef.ref(db, `users/${userId}/images/${imageId}`);
        await firebaseRef.set(locationRef, null);
        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}


const create_image = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken())){
        return res.status(401).send("Sin autorización");
    }
    try {
        let imageCreated = await createImage(req.params.userId, req.body, db);
        console.log('he creado imagen', imageCreated);

        if(imageCreated === null) {
            return res.status(401).send("Usuario no autorizado");
        }
        return res.json({
            ok: true,
            msg: 'Imagen creada',
            image: imageCreated,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error creando imagen '+ err
        });
    }
};

const get_image = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());

    if(!(await verifyToken())){
        return res.status(401).send("Sin autorización");
    }

    try {
        let image = await getImage(req.params.imageId, req.params.userId, db);
        // console.log(image);

        if(image === null) {
            return res.status(401).send("Usuario no autorizado");
        }
        return res.json({
            ok: true,
            msg: 'Imagen obtenida',
            image: image,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error obteniendo imagen'+ err
        });
    }
};

const get_images = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());
    // console.log('miro',req.params);

    if(!(await verifyToken())){
        return res.status(401).send("Sin autorización");
    }

    try {
        let allImages = await getImages(req.params.userId, db);

        // console.log(allImages);

        if(allImages === null) {
            return res.status(401).send("Usuario no autorizado");
        }

        return res.json({
            ok: true,
            msg: 'Imagenes obtenidas',
            images: allImages,
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error obteniendo imagenes'+ err
        });
    }
}


const update_image = async (req, res) => {
    const db = firebaseRef.getDatabase();
    // console.log(req.params.imageId);
    // console.log(req.body);

    if(!(await verifyToken())){
        return res.status(401).send("Sin autorización");
    }

    try {
        let imageUpdated = await updateImage(req.params.userId, req.params.imageId, req.body, db);
        
        console.log(imageUpdated);

        if(imageUpdated === null) {
            return res.status(401).send("Usuario no autorizado");
        }

        return res.json({
            ok: true,
            msg: 'Imagen actualizada',
            image: imageUpdated,
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error actualizando imagen'+ err
        });
    }
};

const delete_image = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken())){
        return res.status(401).send("Sin autorización");
    }

    try {
        let imageDeleted = await deleteImage(req.params.userId, req.params.imageId, db);

        console.log(imageDeleted);

        if(imageDeleted === false) {
            return res.status(401).send("Usuario no autorizado");
        }

        return res.json({
            ok: true,
            msg: 'Imagen eliminada',
        })
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error eliminando imagen'+ err
        });
    }
};

module.exports = {create_image, get_image, get_images,update_image, delete_image}