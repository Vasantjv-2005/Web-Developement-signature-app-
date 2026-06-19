const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");

const loadPDF = async (
    filePath
) => {
    const existingPdf =
        fs.readFileSync(
            filePath
        );

    const pdfDoc =
        await PDFDocument.load(
            existingPdf
        );

    return pdfDoc;
};

const addFieldsToPDF = async (filePath, fields) => {
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    // Load standard Helvetica font
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Compute dynamic pageHeight based on the aspect ratio of the first page
    const refPage = pages[0];
    const refWidth = refPage.getWidth();
    const refHeight = refPage.getHeight();
    const pageHeight = 700 * (refHeight / refWidth);

    for (const field of fields) {
        const { type, x, y, value, signedImage, w, h } = field;
        
        // Calculate container positions using the dynamic pageHeight
        const totalY = (y / 100) * totalPages * pageHeight;
        const pageIndex = Math.min(totalPages - 1, Math.max(0, Math.floor(totalY / pageHeight)));
        const yOnPage = totalY % pageHeight;

        const pdfPage = pages[pageIndex];
        const pWidth = pdfPage.getWidth();
        const pHeight = pdfPage.getHeight();

        const xScale = pWidth / 700;
        const yScale = pHeight / pageHeight;

        const pdfCenterX = (x / 100) * pWidth;
        const pdfCenterY = (1 - (yOnPage / pageHeight)) * pHeight;

        const fieldWidth = w || (type === "Signature" || type === "Initials" ? 150 : 120);
        const fieldHeight = h || (type === "Signature" || type === "Initials" ? 50 : 40);

        if (type === "Signature" || type === "Initials") {
            if (signedImage) {
                try {
                    // Extract base64 image data
                    const base64Data = signedImage.replace(/^data:image\/png;base64,/, "");
                    const imageBuffer = Buffer.from(base64Data, "base64");
                    const embeddedImage = await pdfDoc.embedPng(imageBuffer);

                    // Box dimensions using custom width and height
                    const boxWidth = fieldWidth * xScale;
                    const boxHeight = fieldHeight * yScale;

                    const leftX = pdfCenterX - boxWidth / 2;
                    const bottomY = pdfCenterY - boxHeight / 2;

                    pdfPage.drawImage(embeddedImage, {
                        x: leftX,
                        y: bottomY,
                        width: boxWidth,
                        height: boxHeight,
                    });
                } catch (err) {
                    console.error("Error embedding signature/initials image:", err);
                }
            }
        } else if (type === "Date") {
            // Draw a clean text showing the date value
            const fontSize = 11 * yScale;
            const text = value || new Date().toLocaleDateString();
            const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
            const textHeight = fontSize * 0.7;

            pdfPage.drawText(text, {
                x: pdfCenterX - textWidth / 2,
                y: pdfCenterY - textHeight / 2,
                size: fontSize,
                font: helvetica,
                color: rgb(99 / 255, 102 / 255, 241 / 255), // Indigo color matching theme
            });
        } else if (type === "Checkbox") {
            // Draw a checkbox square and tick line if true
            const boxSize = 14 * xScale;
            const leftX = pdfCenterX - boxSize / 2;
            const bottomY = pdfCenterY - boxSize / 2;

            // Draw checkbox square border
            pdfPage.drawRectangle({
                x: leftX,
                y: bottomY,
                width: boxSize,
                height: boxSize,
                color: rgb(1, 1, 1),
                borderColor: rgb(99 / 255, 102 / 255, 241 / 255),
                borderWidth: 1.5,
            });

            if (value === "true") {
                // Draw checkmark lines
                pdfPage.drawLine({
                    start: { x: leftX + 3 * xScale, y: bottomY + 7 * yScale },
                    end: { x: leftX + 6 * xScale, y: bottomY + 3 * yScale },
                    thickness: 2,
                    color: rgb(16 / 255, 185 / 255, 129 / 255), // Emerald green
                });
                pdfPage.drawLine({
                    start: { x: leftX + 6 * xScale, y: bottomY + 3 * yScale },
                    end: { x: leftX + 11 * xScale, y: bottomY + 11 * yScale },
                    thickness: 2,
                    color: rgb(16 / 255, 185 / 255, 129 / 255), // Emerald green
                });
            }
        } else if (type === "Comment") {
            // Draw comment text inside a light-grey filled rounded box
            const fontSize = 10 * yScale;
            const text = value || "Comment";
            const maxChars = 25;
            const displayPref = text.length > maxChars ? text.substring(0, maxChars) + "..." : text;
            const textWidth = helvetica.widthOfTextAtSize(displayPref, fontSize);
            const textHeight = fontSize * 0.7;

            // Draw a tiny background rect for readability
            const paddingX = 6 * xScale;
            const paddingY = 4 * yScale;
            pdfPage.drawRectangle({
                x: pdfCenterX - textWidth / 2 - paddingX,
                y: pdfCenterY - textHeight / 2 - paddingY,
                width: textWidth + paddingX * 2,
                height: textHeight + paddingY * 2,
                color: rgb(243 / 255, 244 / 255, 246 / 255), // Gray 100
                borderColor: rgb(209 / 255, 213 / 255, 219 / 255), // Gray 300
                borderWidth: 1,
            });

            pdfPage.drawText(displayPref, {
                x: pdfCenterX - textWidth / 2,
                y: pdfCenterY - textHeight / 2,
                size: fontSize,
                font: helvetica,
                color: rgb(55 / 255, 65 / 255, 81 / 255), // Dark gray text
            });
        }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

module.exports = {
    loadPDF,
    addFieldsToPDF,
};