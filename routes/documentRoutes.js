const express = require("express");

const router =
    express.Router();

const {
    uploadDocument,
    getDocuments,
    updateDocumentFields,
    downloadSignedDocument,
} = require(
    "../controllers/documentController"
);

const protect = require(
    "../middleware/authMiddleware"
);

const upload = require(
    "../middleware/uploadMiddleware"
);

router.post(
    "/upload",
    protect,
    upload.single("document"),
    uploadDocument
);

router.get(
    "/",
    protect,
    getDocuments
);

router.put(
    "/:id/fields",
    protect,
    updateDocumentFields
);

router.get(
    "/:id/download",
    protect,
    downloadSignedDocument
);

module.exports =
    router;