"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const entities_1 = __importDefault(require("./routes/entities"));
const documents_1 = __importDefault(require("./routes/documents"));
const messages_1 = __importDefault(require("./routes/messages"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const invites_1 = __importDefault(require("./routes/invites"));
const engagement_1 = __importDefault(require("./routes/engagement"));
const checklist_1 = __importDefault(require("./routes/checklist"));
const reminders_1 = __importDefault(require("./routes/reminders"));
const extensions_1 = __importDefault(require("./routes/extensions"));
const scheduled_1 = __importDefault(require("./routes/scheduled"));
const clientStatus_1 = __importDefault(require("./routes/clientStatus"));
const efileAuthorization_1 = __importDefault(require("./routes/efileAuthorization"));
const permissions_1 = __importDefault(require("./routes/permissions"));
const questionnaire_1 = __importDefault(require("./routes/questionnaire"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/entities', entities_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/invites', invites_1.default);
app.use('/api/engagement', engagement_1.default);
app.use('/api/checklist', checklist_1.default);
app.use('/api/reminders', reminders_1.default);
app.use('/api/extensions', extensions_1.default);
app.use('/api/scheduled', scheduled_1.default);
app.use('/api/client-status', clientStatus_1.default);
app.use('/api/efile-authorization', efileAuthorization_1.default);
app.use('/api/permissions', permissions_1.default);
app.use('/api/questionnaire', questionnaire_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
