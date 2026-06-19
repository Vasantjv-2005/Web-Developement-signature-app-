const express = require("express");

const router =
    express.Router();

const {
    addSignature,
    getSignaturesForDocument,
} = require(
    "../controllers/signatureController"
);

const protect = require(
    "../middleware/authMiddleware"
);

router.post(
    "/add",
    protect,
    addSignature
);

router.get(
    "/document/:documentId",
    protect,
    getSignaturesForDocument
);

module.exports =
    router;