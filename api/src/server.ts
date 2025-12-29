import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import entityRoutes from './routes/entities'
import accountRoutes from './routes/accounts'
import documentRoutes from './routes/documents'
import messageRoutes from './routes/messages'
import dashboardRoutes from './routes/dashboard'
import inviteRoutes from './routes/invites'
import engagementRoutes from './routes/engagement'
import checklistRoutes from './routes/checklist'
import reminderRoutes from './routes/reminders'
import extensionRoutes from './routes/extensions'
import scheduledRoutes from './routes/scheduled'
import clientStatusRoutes from './routes/clientStatus'
import efileAuthorizationRoutes from './routes/efileAuthorization'
import permissionsRoutes from './routes/permissions'
import questionnaireRoutes from './routes/questionnaire'
import clientEntitiesRoutes from './routes/clientEntities'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/entities', entityRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/invites', inviteRoutes)
app.use('/api/engagement', engagementRoutes)
app.use('/api/checklist', checklistRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/extensions', extensionRoutes)
app.use('/api/scheduled', scheduledRoutes)
app.use('/api/client-status', clientStatusRoutes)
app.use('/api/efile-authorization', efileAuthorizationRoutes)
app.use('/api/permissions', permissionsRoutes)
app.use('/api/questionnaire', questionnaireRoutes)
app.use('/api/client/entities', clientEntitiesRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

