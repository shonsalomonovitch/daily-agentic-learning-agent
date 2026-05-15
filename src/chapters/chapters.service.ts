import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Chapter, ChapterMeta } from './chapter.types';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name);
  private readonly agenticFilesDir = path.join(
    process.cwd(),
    'src',
    'agentic-files',
  );

  constructor(private readonly progressService: ProgressService) {}

  getAllChaptersMeta(): ChapterMeta[] {
    const files = fs.readdirSync(this.agenticFilesDir);

    return files
      .filter((f) => f.endsWith('.pdf'))
      .map((fileName) => {
        const number = this.extractChapterNumber(fileName);
        const title = this.extractChapterTitle(fileName);
        return { number, title, fileName };
      })
      .sort((a, b) => a.number - b.number);
  }

  getChapterByNumber(chapterNumber: number): Chapter {
    const chapters = this.getAllChaptersMeta();
    const meta = chapters.find((c) => c.number === chapterNumber);

    if (!meta) {
      throw new NotFoundException(`Chapter ${chapterNumber} not found`);
    }

    const filePath = path.join(this.agenticFilesDir, meta.fileName);
    return { ...meta, filePath };
  }

  getNextChapter(): Chapter {
    const progress = this.progressService.getProgress();
    const nextNumber = progress.nextChapterNumber;
    this.logger.log(`Fetching next chapter: #${nextNumber}`);
    return this.getChapterByNumber(nextNumber);
  }

  private extractChapterNumber(fileName: string): number {
    const match = fileName.match(/chapter-(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractChapterTitle(fileName: string): string {
    return fileName
      .replace(/\.pdf$/i, '')
      .replace(/^chapter-\d+-/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }
}
