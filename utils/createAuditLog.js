const AuditLog = require(
    "../models/AuditLog"
);

const createAuditLog =
    async (
        userId,
        action,
        documentId = null
    ) => {
        try {
            await AuditLog.create({
                user: userId,
                action,
                document:
                    documentId,
            });
        } catch (error) {
            console.error(
                "Audit Log Error:",
                error.message
            );
        }
    };

module.exports =
    createAuditLog;