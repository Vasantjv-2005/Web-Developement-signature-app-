const Document = require(
    "../models/Document"
);
const AuditLog = require(
    "../models/AuditLog"
);
const { loadPDF, addFieldsToPDF } = require("../services/pdfService");

// UPLOAD DOCUMENT
const uploadDocument =
    async (req, res) => {
        try {
            let pages = 1;
            let width = 595.276;
            let height = 841.89;
            try {
                const pdfDoc = await loadPDF(req.file.path);
                pages = pdfDoc.getPageCount();
                if (pages > 0) {
                    const firstPage = pdfDoc.getPages()[0];
                    width = firstPage.getWidth();
                    height = firstPage.getHeight();
                }
            } catch (err) {
                console.error("Failed to count PDF pages:", err);
            }

            const document =
                await Document.create({
                    owner:
                        req.user._id,

                    title:
                        req.body.title,

                    filePath:
                        req.file.path,

                    pages,
                    width,
                    height,
                });

            // Log Audit Event
            await AuditLog.create({
                user: req.user._id,
                action: "Document Created",
                document: document._id,
            });

            res.status(201).json({
                success: true,
                document,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// GET DOCUMENTS
const getDocuments =
    async (req, res) => {
        try {
            const documents =
                await Document.find({
                    owner:
                        req.user._id,
                });

            // Populate page details dynamically for existing documents
            const updatedDocs = [];
            for (const doc of documents) {
                if (doc.pages === undefined || doc.pages === null || doc.pages === 1 || !doc.width || !doc.height) {
                    try {
                        const pdfDoc = await loadPDF(doc.filePath);
                        doc.pages = pdfDoc.getPageCount();
                        if (doc.pages > 0) {
                            const firstPage = pdfDoc.getPages()[0];
                            doc.width = firstPage.getWidth();
                            doc.height = firstPage.getHeight();
                        }
                        await doc.save();
                    } catch (err) {
                        // ignore/fallback
                    }
                }
                updatedDocs.push(doc);
            }

            res.status(200).json({
                success: true,
                documents: updatedDocs,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// UPDATE DOCUMENT FIELDS
const updateDocumentFields = async (req, res) => {
    try {
        const document = await Document.findByIdAndUpdate(
            req.params.id,
            { fields: req.body.fields },
            { new: true }
        );
        res.status(200).json({
            success: true,
            document,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DOWNLOAD SIGNED DOCUMENT
const downloadSignedDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        const pdfBytes = await addFieldsToPDF(document.filePath, document.fields);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(document.title)}.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error("Failed to generate signed PDF:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    updateDocumentFields,
    downloadSignedDocument,
};