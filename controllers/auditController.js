const AuditLog = require(
    "../models/AuditLog"
);

const getAuditLogs =
    async (req, res) => {
        try {
            const logs =
                await AuditLog.find()
                    .populate("user", "name email")
                    .populate("document", "title")
                    .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                logs,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

module.exports = {
    getAuditLogs,
};