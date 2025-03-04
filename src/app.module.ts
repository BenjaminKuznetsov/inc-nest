import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { LoggerMiddleware } from './common/middleware/logger';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost/nest-blogger-platform'),
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@inc-nest.6mf1q.mongodb.net/inc-nest?retryWrites=true&w=majority&appName=inc-nest',
    ),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Логирует все маршруты
  }
}
