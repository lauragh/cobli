//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const Color = require('../models/color');
const { verifyToken } = require('../helpers/verifyToken');

////* CRUD FUNCTIONS *////

//Create a color
async function createColor(imageId, userId, data, db) {
    try{
        let color = new Color(
            data.color_name,
            data.clarity,
            data.hexCod,
            data.rgb,
            data.hsl,
            data.hsv,
            data.position
        );

        let colorObject = {
            color_name: color.color_name,
            clarity: color.clarity,
            hexCod: color.hexCod,
            rgb: color.rgb,
            hsl: color.hsl,
            hsv: color.hsv,
            position: color.position
        }

        const imageRef = firebaseRef.ref(db, `users/${userId}/images/${imageId}/colorTags`);
        const newColorRef = firebaseRef.push(imageRef);
        await firebaseRef.set(
            newColorRef, colorObject
        );
        console.log(color)
        return colorObject;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return null;
    }
}

//Get all the colors from one image
async function getColors(imageId, userId, db) {
    let result = null;
    await firebaseRef.get(
        firebaseRef.child(db, `users/${userId}/images/${imageId}/colorTags`)
    )
    .then((snapshot) => {
        if(snapshot.exists()){
            result = snapshot.val();
        }
        else{
            console.log("Not colors found");
        }
    });

    return result;
}

//Modify one color in particular
// async function updateColor(colorId, imageId, userId, data, db) {
//     try{
//         let color = new Color(
//             data.color_name,
//             data.clarity,
//             data.hexCod,
//             data.rgb,
//             data.hsl,
//             data.hsv,
//             data.position
//         );

//         let colorObject = {
//             color_name: color.color_name,
//             clarity: color.clarity,
//             hexCod: color.hexCod,
//             rgb: color.rgb,
//             hsl: color.hsl,
//             hsv: color.hsv,
//             position: color.position
//         }

//         let locationRef = firebaseRef.ref(db, `users/${userId}/images/${imageId}/colorTags/${colorId}`);
//         await firebaseRef.update(locationRef, colorObject);

//         return true;
        
//     }
//     catch(err){
//         console.log("An error has occured updating color:" + err);
//         return false;
//     }
// }

//Delete color
async function deleteColor(colorId, imageId, userId, db) {
    try{
        let locationRef = firebaseRef.ref(db, `users/${userId}/images/${imageId}/colorTags/${colorId}`);
        await firebaseRef.set(locationRef, null);

        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}



const create_color = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }
    try {
        let colorCreated = await createColor(req.params.imageId, req.params.userId, req.body, db);
        console.log(colorCreated);

        if(colorCreated === null) {
            return res.status(401).send("Sin autorización");
        }

        return res.json({
            ok: true,
            msg: 'Color creado',
            color: colorCreated,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error creando color '+ err
        });
    }
}

const get_color = async (req, res) => {
    const db = firebaseRef.ref(firebaseRef.getDatabase());

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }
    try {
        let colors = await getColors(req.params.imageId, req.params.userId, db);
        console.log(colors);

        if(colors === null) {
            return res.status(401).send("Sin autorización");
        }
        
        return res.json({
            ok: true,
            msg: 'Color obtenido',
            colors: colors,
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error obteniendo color '+ err
        });
    }
};

    // const update_color = async (req, res) => {
    //     const db = firebaseRef.getDatabase();

    //     if(req.params.imageId !== undefined && req.params.userId !== undefined && req.params.colorId !== undefined && Object.keys(req.params).length === 3  && req.body !== undefined){
    //         let color = await updateColor(req.params.colorId, req.params.imageId, req.params.userId, req.body, db);
    //         console.log('color',color);
    //         res.send(color);
    //         res.status(color === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    //     }
    // };

const delete_color = async (req, res) => {
    const db = firebaseRef.getDatabase();

    if(!(await verifyToken(req.headers.token))){
        return res.status(401).send("Sin autorización");
    }
    try {
        let colorDeleted = await deleteColor(req.params.colorId, req.params.imageId, req.params.userId, db);
        console.log(colorDeleted);

        if(colorDeleted === false) {
            return res.status(401).send("Sin autorización");
        }

        return res.json({
            ok: true,
            msg: 'Color eliminado',
        });
    }
    catch(err){
        return  res.status(httpCodes.BAD_REQUEST).json({
            ok: false,
            msg: 'Error eliminando color '+ err
        });
    }
};

module.exports = {create_color, get_color, delete_color}