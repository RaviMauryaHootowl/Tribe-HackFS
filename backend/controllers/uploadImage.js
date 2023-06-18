var cloudinary = require("cloudinary").v2;


const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
};

module.exports = async (image) => {
    cloudinary.config({
        cloud_name: "dbyeayir9",
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    //image = > base64
    console.log(process.env.CLOUDINARY_API_KEY);
    console.log(process.env.CLOUDINARY_API_SECRET);
    console.log(image);
    try {
        const result = await cloudinary.uploader.upload(image, opts);
        console.log(result);
        return result;
    } catch (e) {
        console.log(e);
    }
};
