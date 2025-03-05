import { configModule } from './setup/dynamic-config-module'; // всегда д/б самым первым импортом
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { LoggerMiddleware } from './common/middleware/logger';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        return {
          uri: coreConfig.mongoURI,
        };
      },
      inject: [CoreConfig],
    }),
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
