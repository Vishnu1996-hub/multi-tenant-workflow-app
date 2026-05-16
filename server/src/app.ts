import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.router';
import tenantsRoutes from './modules/tenants/tenants.router';
import workflowsRouter from './modules/workflows/workflow.router';
import itemRouter from './modules/items/item.router';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/tenants/:tenantId/workflows', workflowsRouter);
app.use('/api/tenants/:tenantId/items', itemRouter);

app.use(errorHandler);

export default app;