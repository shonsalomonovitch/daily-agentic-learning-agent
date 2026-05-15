import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ChapterMeta } from '../chapters/chapter.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const port = this.configService.get<number>('EMAIL_PORT', 587);
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('EMAIL_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.configService.getOrThrow<string>('EMAIL_USER'),
        pass: this.configService.getOrThrow<string>('EMAIL_PASS'),
      },
    });
  }

  async sendChapterEmail(
    chapter: ChapterMeta,
    htmlContent: string,
  ): Promise<void> {
    const to = this.configService.getOrThrow<string>('EMAIL_TO');
    const from = this.configService.getOrThrow<string>('EMAIL_USER');
    const subject = `Daily Agentic Learning: Chapter ${chapter.number} - ${chapter.title}`;

    this.logger.log(`Sending email for chapter ${chapter.number} to ${to}`);

    await this.transporter.sendMail({
      from,
      to,
      subject,
      html: this.wrapInEmailTemplate(htmlContent, chapter),
    });

    this.logger.log(`Email sent successfully for chapter ${chapter.number}`);
  }

  private wrapInEmailTemplate(htmlContent: string, chapter: ChapterMeta): string {
    const date = new Date().toLocaleDateString('en-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Georgia, 'Times New Roman', serif;
      background-color: #f0f2f5;
      color: #222;
      padding: 24px 16px;
    }

    .wrapper {
      max-width: 720px;
      margin: 0 auto;
    }

    /* ── Top header banner ── */
    .banner {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
      border-radius: 12px 12px 0 0;
      padding: 32px 36px;
      color: #fff;
    }
    .banner .label {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #a0b4d0;
      margin-bottom: 10px;
    }
    .banner h1 {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.3;
      color: #fff;
      border: none;
      padding: 0;
      margin: 0;
    }
    .banner .meta {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #7fa8c9;
      margin-top: 10px;
    }

    /* ── Body card ── */
    .body-card {
      background: #ffffff;
      border-radius: 0 0 12px 12px;
      padding: 0 36px 36px;
      border: 1px solid #dde3ec;
      border-top: none;
    }

    /* ── Section blocks ── */
    .section {
      border-left: 4px solid #0f3460;
      background: #f8f9fb;
      border-radius: 0 8px 8px 0;
      padding: 18px 22px;
      margin: 24px 0;
    }
    .section.tldr {
      border-left-color: #27ae60;
      background: #f0faf4;
    }
    .section.tldr h2 { color: #1e8449; }
    .section.hebrew {
      border-left: none;
      border-right: 4px solid #e05a00;
      border-radius: 8px 0 0 8px;
      direction: rtl;
      text-align: right;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    .section h2 {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #0f3460;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #dde3ec;
    }
    .section.hebrew h2 {
      color: #e05a00;
    }

    /* ── Typography ── */
    p {
      font-size: 15px;
      line-height: 1.8;
      color: #333;
      margin: 10px 0;
    }
    strong { color: #111; }
    em { color: #444; }

    ul, ol {
      padding-left: 22px;
      margin: 10px 0;
    }
    .section.hebrew ul,
    .section.hebrew ol {
      padding-left: 0;
      padding-right: 22px;
    }
    li {
      font-size: 15px;
      line-height: 1.7;
      color: #333;
      margin-bottom: 6px;
    }

    /* ── Code ── */
    code {
      font-family: 'Courier New', Courier, monospace;
      background: #eef2f7;
      color: #c0392b;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
    pre {
      background: #0d1117;
      color: #e6edf3;
      padding: 20px 22px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.65;
      margin: 16px 0;
      border: 1px solid #30363d;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: inherit;
      border-radius: 0;
    }
    /* Fake syntax highlight for TypeScript keywords */
    pre code .kw  { color: #ff7b72; }
    pre code .str { color: #a5d6ff; }
    pre code .cmt { color: #8b949e; font-style: italic; }

    /* ── Tables ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 14px;
    }
    th {
      background: #0f3460;
      color: #fff;
      padding: 10px 14px;
      text-align: left;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
    }
    td {
      padding: 9px 14px;
      border-bottom: 1px solid #e5e9f0;
      color: #333;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: #f4f6fa; }

    /* ── Blockquote / callout ── */
    blockquote {
      border-left: 4px solid #e05a00;
      background: #fff8f3;
      padding: 14px 18px;
      margin: 14px 0;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: #555;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      padding: 20px 0 4px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      color: #999;
    }
    .footer strong { color: #777; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="banner">
    <div class="label">Daily Agentic Learning &mdash; Chapter ${chapter.number}</div>
    <h1>${chapter.title}</h1>
    <div class="meta">${date}</div>
  </div>

  <div class="body-card">
    ${this.wrapSections(htmlContent)}
    <div class="footer"><strong>Daily Agentic Learning Agent</strong> &mdash; One chapter a day.</div>
  </div>

</div>
</body>
</html>`;
  }

  /**
   * Wraps each <h2>...</h2> + following content into a styled .section div.
   * Hebrew sections (7, 8, 9) get the RTL class.
   */
  private wrapSections(html: string): string {
    // Split on h2 tags, keeping them as delimiters
    const parts = html.split(/(?=<h2)/i);
    // Section 7 is "הסבר בעברית" in the new prompt structure
    const hebrewSectionNumbers = new Set([7]);
    let sectionIndex = 0;

    return parts
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return '';

        // Not a section block (e.g. the h1 at the top)
        if (!trimmed.toLowerCase().startsWith('<h2')) {
          return `<div style="padding: 8px 0;">${trimmed}</div>`;
        }

        sectionIndex++;
        const isHebrew = hebrewSectionNumbers.has(sectionIndex);
        const isTldr = sectionIndex === 1;
        let cssClass = isHebrew ? 'section hebrew' : 'section';
        if (isTldr) cssClass += ' tldr';
        return `<div class="${cssClass}">${trimmed}</div>`;
      })
      .join('\n');
  }
}
