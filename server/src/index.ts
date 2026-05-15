import app from './app';
import { config } from './config';
import { connectDB } from './db';

async function bootstrap() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Backend running on port ${config.port}`);
  });
}

bootstrap();