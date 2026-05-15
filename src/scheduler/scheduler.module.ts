import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ChaptersModule } from '../chapters/chapters.module';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [ChaptersModule, AiModule, EmailModule, ProgressModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
