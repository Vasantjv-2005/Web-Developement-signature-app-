const mongoose = require("mongoose");

const documentSchema =
    new mongoose.Schema(
        {
            owner: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "User",
                required: true,
            },

            title: {
                type: String,
                required: true,
            },

            filePath: {
                type: String,
                required: true,
            },

            status: {
                type: String,
                enum: [
                    "pending",
                    "signed",
                ],
                default:
                    "pending",
            },

            pages: {
                type: Number,
                default: 1,
            },

            width: {
                type: Number,
                default: 595.276,
            },

            height: {
                type: Number,
                default: 841.89,
            },

            fields: {
                type: Array,
                default: [],
            },
        },
        {
            timestamps: true,
        }
    );

module.exports =
    mongoose.model(
        "Document",
        documentSchema
    );