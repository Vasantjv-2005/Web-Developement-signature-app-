const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const signatureRoutes = require("./routes/signatureRoutes");
const auditRoutes = require("./routes/auditRoutes");

// MIDDLEWARE
const errorMiddleware = require("./middleware/errorMiddleware");

// LOAD ENV
dotenv.config();

// CONNECT DATABASE
connectDB();

const app = express();

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors());

// STATIC FILES
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// HEALTH CHECK
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "Document Signature API Running Successfully",
    });
});

// ROUTES
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/documents",
    documentRoutes
);

app.use(
    "/api/signatures",
    signatureRoutes
);

app.use(
    "/api/audit",
    auditRoutes
);

// ERROR HANDLER
app.use(errorMiddleware);

// PORT
const PORT =
    process.env.PORT || 5001;

// START SERVER
app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});