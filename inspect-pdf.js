const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

const inspect = async () => {
    const pdfBytes = fs.readFileSync("test_signed_with_fields.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    console.log(`PDF loaded. Total pages: ${pages.length}`);
    
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        console.log(`Page ${i + 1}:`);
        console.log(`  Width: ${page.getWidth()}, Height: ${page.getHeight()}`);
        
        // Inspect resources
        const node = page.node;
        const resources = node.Resources();
        if (resources) {
            const xObjects = resources.get(PDFDocument.empty().context.obj("XObject"));
            if (xObjects) {
                console.log(`  XObjects (images/shapes) found: ${xObjects.keys().length}`);
                console.log(`  Keys:`, xObjects.keys().map(k => k.toString()));
            } else {
                console.log(`  No XObjects found on page.`);
            }
        }
    }
};

inspect();
