import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ChaptersService } from '../chapters/chapters.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly chaptersService: ChaptersService,
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
    private readonly progressService: ProgressService,
  ) {}

  onModuleInit() {
    const cronExpression = this.configService.get<string>(
      'DAILY_CRON',
      '0 6 * * *',
    );

    const job = new CronJob(cronExpression, () => {
      void this.sendDailyChapter();
    });

    this.schedulerRegistry.addCronJob('daily-learning', job);
    job.start();

    this.logger.log(
      `Daily learning cron registered with expression: "${cronExpression}"`,
    );
  }

  async sendDailyChapter(): Promise<void> {
    this.logger.log('Daily cron triggered: sending next chapter');

    try {
      const chapter = this.chaptersService.getNextChapter();
      const htmlContent =
        await this.aiService.generateChapterExplanation(chapter);
      await this.emailService.sendChapterEmail(chapter, htmlContent);
      this.progressService.markChapterSent(chapter.number);
      this.logger.log(
        `Daily chapter sent successfully: #${chapter.number} - ${chapter.title}`,
      );
    } catch (error) {
      this.logger.error('Failed to send daily chapter', error);
    }
  }
}
