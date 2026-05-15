import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import { Chapter } from '../chapters/chapter.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateChapterExplanation(chapter: Chapter): Promise<string> {
    const model = this.configService.get<string>(
      'ANTHROPIC_MODEL',
      'claude-haiku-4-5-20251001',
    );
    const maxTokens = parseInt(
      this.configService.get<string>('MAX_TOKENS', '16000'),
      10,
    );

    this.logger.log(
      `Generating explanation for chapter ${chapter.number}: ${chapter.title} (model: ${model})`,
    );

    const pdfBuffer = fs.readFileSync(chapter.filePath);
    const pdfBase64 = pdfBuffer.toString('base64');

    const message = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: this.buildPrompt(chapter.title),
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    this.logger.log(
      `Successfully generated explanation for chapter ${chapter.number} (stop_reason: ${message.stop_reason})`,
    );

    return this.cleanHtml(content.text);
  }

  /**
   * Strip any accidental markdown code fences Claude might add despite instructions.
   * e.g. ```html ... ``` or ```typescript ... ```
   */
  private cleanHtml(raw: string): string {
    return raw
      .replace(/^```[a-z]*\n?/gim, '')
      .replace(/^```\n?/gim, '')
      .trim();
  }

  private buildPrompt(chapterTitle: string): string {
    return `You are a senior software architect and AI systems educator writing a daily learning email for an Israeli backend developer.

The reader has solid TypeScript/NestJS experience and wants to deeply understand Agentic Design Patterns — not just in theory, but in real engineering practice.

---

HTML FORMATTING RULES — follow strictly:
- Return raw HTML only. No \`\`\`html fences, no markdown, no backtick code blocks.
- Every paragraph must be wrapped in <p> tags. Never place bare text outside a tag.
- Use <ul><li> for bullet points, <ol><li> for numbered steps.
- Use <strong> for key terms. Use <em> for subtle emphasis.
- Use <blockquote> for important quotes, warnings, or key insights from the PDF.
- For any diagram or table in the PDF: recreate it as a clean HTML <table> with <th> column headers. Never use ASCII art.
- For code examples: use <pre><code class="language-typescript">...</code></pre>.
- Do not add any inline style= attributes. The email template handles all styling.
- No emojis. Keep tone professional but clear.
- Each section should be focused. No walls of text — break ideas into short paragraphs.

---

CONTENT RULES:
- Teach the material — do not just list bullet points.
- Every section must have real substance: reasoning, implications, tradeoffs.
- Code examples must be TypeScript/NestJS when possible. Make them concrete and realistic, not pseudo-code.
- The Hebrew section must be written in natural, fluent Israeli engineering Hebrew — the way an experienced Israeli backend developer would explain it to a colleague. Not a word-for-word English translation. Use terms like "מנגנון", "תהליך", "ממשק", "רכיב", "תבנית" naturally. Write in a direct, confident tone.
- "How companies use this" must name real companies or real product types (e.g. GitHub Copilot, Notion AI, Linear, Stripe, etc.).

---

REQUIRED STRUCTURE — follow exactly, use these exact <h2> texts:

<h1>Daily Agentic Learning: ${chapterTitle}</h1>

<h2>TL;DR — 5 Minutes</h2>
<p>3–4 sentences. The core idea, why it matters, one real-world analogy. A developer should be able to explain this pattern in a standup after reading only this section.</p>

<h2>Core Idea</h2>
<p>What is the fundamental concept? Define it precisely. What problem does it solve? What is the mental model?</p>

<h2>Deep Dive</h2>
<p>Full technical explanation. How does it work step by step? What are the tradeoffs? When should you use it vs. alternatives? Reference specific content from the PDF including figures and diagrams.</p>

<h2>Practical Engineering Example</h2>
<p>A realistic backend scenario using this pattern. Then a TypeScript/NestJS code example:</p>
<pre><code class="language-typescript">// realistic NestJS/TypeScript example here</code></pre>
<p>Explain what the code demonstrates.</p>

<h2>How Companies Use This in Real Products</h2>
<p>Name 2–3 real companies or well-known products that apply this pattern. Explain concretely how.</p>

<h2>If You Remember Only 3 Things</h2>
<ol>
  <li><strong>First thing</strong> — one sentence explaining why.</li>
  <li><strong>Second thing</strong> — one sentence explaining why.</li>
  <li><strong>Third thing</strong> — one sentence explaining why.</li>
</ol>

<h2>הסבר בעברית</h2>
<p>הסבר מלא ומעמיק בעברית טבעית ושוטפת. כתוב כאילו אתה מסביר לקולגה מפתח ישראלי בכיר. השתמש במונחים טכניים בעברית כשאפשר. כלול: מה הרעיון המרכזי, למה זה חשוב, איך זה עובד בפועל, ודוגמה קצרה מהעולם האמיתי.</p>

<h2>Interview Notes</h2>
<p>How would you answer "explain X pattern" in a senior engineer interview? What follow-up questions should you expect? What tradeoffs show depth of understanding?</p>

<h2>Mini Project</h2>
<p>A small, concrete project you can build in 1–2 hours to internalize this pattern. Be specific: what to build, which NestJS modules/services to use, what the expected outcome is.</p>`;
  }
}
