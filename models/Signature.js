const mongoose = require("mongoose");

const signatureSchema =
    new mongoose.Schema(
        {
            document: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,

                ref: "Document",

                required: true,
            },

            signer: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,

                ref: "User",

                required: true,
            },

            signatureImage: {
                type: String,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    );

module.exports =
    mongoose.model(
        "Signature",
        signatureSchema
    );