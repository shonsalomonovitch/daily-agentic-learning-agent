import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChaptersService } from './chapters/chapters.service';
import { AiService } from './ai/ai.service';
import { EmailService } from './email/email.service';
import { ProgressService } from './progress/progress.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const chaptersService = app.get(ChaptersService);
  const aiService = app.get(AiService);
  const emailService = app.get(EmailService);
  const progressService = app.get(ProgressService);

  try {
    const chapter = chaptersService.getNextChapter();
    console.log(`\nSending chapter ${chapter.number}: ${chapter.title}`);

    const html = await aiService.generateChapterExplanation(chapter);
    await emailService.sendChapterEmail(chapter, html);
    progressService.markChapterSent(chapter.number);

    console.log(`Chapter ${chapter.number} sent successfully. Next: chapter ${chapter.number + 1}\n`);
  } finally {
    await app.close();
  }
}

main().catch((err: Error) => {
  console.error('\nFailed to send chapter:', err.message || err);
  process.exit(1);
});
