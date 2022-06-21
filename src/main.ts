import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 5000;
  app.enableCors();

  await app.listen(PORT, () =>
    console.log(`Server is listening on port: ${PORT}`),
  );
}
bootstrap();
