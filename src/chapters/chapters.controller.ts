import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Logger,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { ProgressService } from '../progress/progress.service';

@Controller('chapters')
export class ChaptersController {
  private readonly logger = new Logger(ChaptersController.name);

  constructor(
    private readonly chaptersService: ChaptersService,
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
    private readonly progressService: ProgressService,
  ) {}

  @Get()
  getAllChapters() {
    return this.chaptersService.getAllChaptersMeta();
  }

  @Post('send/:chapterNumber')
  async sendChapter(@Param('chapterNumber', ParseIntPipe) chapterNumber: number) {
    this.logger.log(`Manual send triggered for chapter ${chapterNumber}`);

    const chapter = this.chaptersService.getChapterByNumber(chapterNumber);
    const htmlContent = await this.aiService.generateChapterExplanation(chapter);
    await this.emailService.sendChapterEmail(chapter, htmlContent);
    this.progressService.markChapterSent(chapterNumber);

    return {
      success: true,
      message: `Chapter ${chapterNumber} (${chapter.title}) sent successfully`,
    };
  }

  @Post('send-next')
  async sendNextChapter() {
    const progress = this.progressService.getProgress();
    this.logger.log(`Send-next triggered. Next chapter: ${progress.nextChapterNumber}`);

    const chapter = this.chaptersService.getNextChapter();
    const htmlContent = await this.aiService.generateChapterExplanation(chapter);
    await this.emailService.sendChapterEmail(chapter, htmlContent);
    this.progressService.markChapterSent(chapter.number);

    return {
      success: true,
      message: `Chapter ${chapter.number} (${chapter.title}) sent successfully`,
      nextChapterNumber: progress.nextChapterNumber + 1,
    };
  }

  @Post('reset-progress')
  resetProgress() {
    this.progressService.resetProgress();
    return { success: true, message: 'Progress reset to chapter 1' };
  }
}
