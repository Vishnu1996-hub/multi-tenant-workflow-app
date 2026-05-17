import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.router';
import tenantsRoutes from './modules/tenants/tenants.router';
import workflowsRouter from './modules/workflows/workflow.router';
import itemRouter from './modules/items/item.router';
import requestsRouter from './modules/requests/request.router';
import { httpLogger } from './middleware/logger';

const app = express();

app.use(httpLogger);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
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
app.use("/api/tenants/:tenantId/requests", requestsRouter);

app.use(errorHandler);

export default app;