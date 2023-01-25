//Imports
const firebaseRef = require('../database/configdb');
const httpCodes = require('../database/httpCodes');
const Color = require('../entities/color');

const usuario = "-NMcYHxLY0F-yfnPx7b_";
const image = "-NMZgEPiehjrdVC68OpT";

////* CRUD FUNCTIONS *////

//Create a color
async function createColor(imageId, data, db) {
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

        const imageRef = firebaseRef.ref(db, `users/${usuario}/images/${imageId}/colorTags`);
        const newColorRef = firebaseRef.push(imageRef);
        await firebaseRef.set(
            newColorRef, colorObject
        );
        console.log(color)
        return true;
    }
    catch(err){
        console.log("An error has occured:" + err);
        return false;
    }
}

//Get all the colors from one image
async function getColors(db) {
    let result = null;
    await firebaseRef.get(
        firebaseRef.child(db, `users/${usuario}/images/${image}/colorTags`)
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
async function updateColor(colorId, data, db) {
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

        let locationRef = firebaseRef.ref(db, `users/${usuario}/images/${image}/colorTags/${colorId}`);
        await firebaseRef.update(locationRef, colorObject);

        return true;
        
    }
    catch(err){
        console.log("An error has occured updating color:" + err);
        return false;
    }
}

//Delete color
async function deleteColor(colorId, db) {
    try{
        let locationRef = firebaseRef.ref(db, `users/${usuario}/images/${image}/colorTags/${colorId}`);
        await firebaseRef.set(locationRef, null);

        return true;
    }
    catch(err){
        console.log("An error has occured deleting color:" + err);
        return false;
    }
}



    const create_color = async (req, res) => {
        const db = firebaseRef.getDatabase();
        if(req.query.imageId !== undefined && Object.keys(req.query).length === 1 && req.body !== undefined){
            let colorCreated = await createColor(req.query.imageId, req.body, db);
            console.log(colorCreated);
            res.status(colorCreated === null ? httpCodes.BAD_REQUEST : httpCodes.CREATED);
            res.send();
        }
    }

    const get_color = async (req, res) => {
        const db = firebaseRef.ref(firebaseRef.getDatabase());

        let colors = await getColors(db);
        // console.log(colors["-NMe6fqwdDOAU-MV_lp1"]);
        // console.log(colors[Object.keys(colors)[0]].color_name);
        console.log(colors);
        res.send(colors);
        res.status(colors === null ? httpCodes.NOT_FOUND : httpCodes.OK);
    };

    const update_color = async (req, res) => {
        const db = firebaseRef.getDatabase();

        if(req.query.colorId !== undefined && Object.keys(req.query).length === 1 && req.body !== undefined){
            color = await updateColor(req.query.colorId, req.body, db);
            console.log('color',color);
            res.send(color);
            res.status(color === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
    };

    const delete_color = async (req, res) => {
        const db = firebaseRef.getDatabase();
        if(req.query.colorId !== undefined && Object.keys(req.query).length === 1){
            let colorDeleted = await deleteColor(req.query.colorId, db);
            res.send();
            res.status(colorDeleted === null ? httpCodes.NOT_FOUND : httpCodes.OK);
        }
        res.send();
    };

module.exports = {create_color, get_color, update_color, delete_color}