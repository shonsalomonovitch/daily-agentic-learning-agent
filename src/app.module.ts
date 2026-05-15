import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ChaptersModule } from './chapters/chapters.module';
import { AiModule } from './ai/ai.module';
import { EmailModule } from './email/email.module';
import { ProgressModule } from './progress/progress.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ChaptersModule,
    AiModule,
    EmailModule,
    ProgressModule,
    SchedulerModule,
  ],
})
export class AppModule {}
