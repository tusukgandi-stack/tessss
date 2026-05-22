import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');

function parseMarkdownFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!fmMatch) return null;

  const frontmatterStr = fmMatch[1];
  const content = fmMatch[2].trim();

  // Simple frontmatter parser
  const data: Record<string, string> = {};
  frontmatterStr.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  });

  return { ...data, content };
}

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  try {
    const filePath = path.join(blogDir, `${id}.md`);

    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const article = parseMarkdownFile(filePath);

    return new Response(JSON.stringify(article), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;

  try {
    const body = await request.json();
    const { title, tag, description, date, emoji, content } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const readTime = `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`;

    const frontmatter = `---
title: "${title}"
description: "${description || ''}"
date: "${date || new Date().toISOString().split('T')[0]}"
tag: "${tag || 'AI Update'}"
emoji: "${emoji || '📝'}"
readTime: "${readTime}"
---`;

    const fileContent = `${frontmatter}\n\n${content}`;

    const filePath = path.join(blogDir, `${id}.md`);
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return new Response(
      JSON.stringify({ success: true, id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;

  try {
    const filePath = path.join(blogDir, `${id}.md`);

    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    fs.unlinkSync(filePath);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
