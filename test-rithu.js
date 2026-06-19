const connectDB = require("./config/db");
const Document = require("./models/Document");
const { addFieldsToPDF } = require("./services/pdfService");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const test = async () => {
    await connectDB();
    const doc = await Document.findById("6a34dff686725f2c219dae23");
    if (!doc) {
        console.error("Document not found.");
        process.exit(1);
    }
    console.log("Document loaded:", doc.title, "fields:", doc.fields);
    
    try {
        console.log("Generating signed PDF...");
        const pdfBytes = await addFieldsToPDF(doc.filePath, doc.fields);
        fs.writeFileSync("rithu_signed.pdf", pdfBytes);
        console.log("Successfully generated rithu_signed.pdf of size:", pdfBytes.length);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
    }
    process.exit(0);
};

test();
