import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Progress {
  nextChapterNumber: number;
  lastSentChapterNumber: number | null;
  lastSentAt: string | null;
}

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');

const DEFAULT_PROGRESS: Progress = {
  nextChapterNumber: 1,
  lastSentChapterNumber: null,
  lastSentAt: null,
};

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  getProgress(): Progress {
    if (!fs.existsSync(PROGRESS_FILE)) {
      this.logger.log('Progress file not found, creating with defaults');
      this.writeProgress(DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }

    const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(raw) as Progress;
  }

  markChapterSent(chapterNumber: number): void {
    const progress = this.getProgress();
    progress.lastSentChapterNumber = chapterNumber;
    progress.lastSentAt = new Date().toISOString();
    progress.nextChapterNumber = chapterNumber + 1;
    this.writeProgress(progress);
    this.logger.log(
      `Progress updated: chapter ${chapterNumber} sent, next is ${progress.nextChapterNumber}`,
    );
  }

  resetProgress(): void {
    this.writeProgress(DEFAULT_PROGRESS);
    this.logger.log('Progress reset to chapter 1');
  }

  private writeProgress(progress: Progress): void {
    const dir = path.dirname(PROGRESS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
  }
}
