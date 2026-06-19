const connectDB = require("./config/db");
const Document = require("./models/Document");
const { addFieldsToPDF } = require("./services/pdfService");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const test = async () => {
    await connectDB();
    const docs = await Document.find({});
    if (docs.length === 0) {
        console.error("No documents found.");
        process.exit(1);
    }
    const doc = docs[0];

    // Create a dummy transparent 1x1 pixel PNG base64 for test
    const dummyPngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    doc.fields = [
        {
            id: "sig1",
            type: "Signature",
            x: 25.0,
            y: 20.0,
            value: "",
            signedImage: dummyPngBase64
        },
        {
            id: "init1",
            type: "Initials",
            x: 75.0,
            y: 20.0,
            value: "",
            signedImage: dummyPngBase64
        },
        {
            id: "date1",
            type: "Date",
            x: 50.0,
            y: 40.0,
            value: "2026-06-19"
        },
        {
            id: "check1",
            type: "Checkbox",
            x: 50.0,
            y: 60.0,
            value: "true"
        },
        {
            id: "comm1",
            type: "Comment",
            x: 50.0,
            y: 80.0,
            value: "This is a test comment!"
        }
    ];

    await doc.save();
    console.log("Saved test fields to database document.");

    try {
        console.log("Generating PDF with test fields...");
        const pdfBytes = await addFieldsToPDF(doc.filePath, doc.fields);
        fs.writeFileSync("test_signed_with_fields.pdf", pdfBytes);
        console.log("Successfully generated test_signed_with_fields.pdf of size:", pdfBytes.length);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
    }
    process.exit(0);
};

test();
