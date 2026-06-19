const Signature = require(
    "../models/Signature"
);
const Document = require(
    "../models/Document"
);
const AuditLog = require(
    "../models/AuditLog"
);

// ADD SIGNATURE
const addSignature =
    async (req, res) => {
        try {
            const signature =
                await Signature.create({
                    document:
                        req.body.document,

                    signer:
                        req.user._id,

                    signatureImage:
                        req.body.signatureImage,
                });

            // Update document status to signed
            await Document.findByIdAndUpdate(req.body.document, {
                status: "signed",
            });

            // Log Audit Event
            await AuditLog.create({
                user: req.user._id,
                action: "Document Signed",
                document: req.body.document,
            });

            res.status(201).json({
                success: true,
                signature,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// GET SIGNATURES FOR DOCUMENT
const getSignaturesForDocument = async (req, res) => {
    try {
        const signatures = await Signature.find({
            document: req.params.documentId
        });
        res.status(200).json({
            success: true,
            signatures
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addSignature,
    getSignaturesForDocument,
};