const connectDB = require("./config/db");
const Document = require("./models/Document");
const dotenv = require("dotenv");

dotenv.config();

const printDocs = async () => {
    await connectDB();
    const docs = await Document.find({});
    for (const doc of docs) {
        console.log(`Document ID: ${doc._id}`);
        console.log(`Title: ${doc.title}`);
        console.log(`Pages: ${doc.pages}`);
        console.log(`Width: ${doc.width}, Height: ${doc.height}`);
        console.log(`Fields count: ${doc.fields.length}`);
        doc.fields.forEach((f, idx) => {
            console.log(`  Field [${idx}]:`, {
                id: f.id,
                type: f.type,
                x: f.x,
                y: f.y,
                w: f.w,
                h: f.h,
                value: f.value,
                hasImage: !!f.signedImage,
                imageLength: f.signedImage ? f.signedImage.length : 0
            });
        });
    }
    process.exit(0);
};

printDocs();
