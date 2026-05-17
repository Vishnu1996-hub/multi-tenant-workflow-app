import app from './app';
import { config } from './config';
import { connectDB } from './db';
import { logger } from './utils/logger';

async function bootstrap() {
  await connectDB();

  app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, 'Backend server started');
  });
}

bootstrap();