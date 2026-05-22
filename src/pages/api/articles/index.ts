import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = async () => {
  try {
    const posts = await getCollection('blog');
    const articles = posts.map(post => ({
      id: post.id,
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      tag: post.data.tag,
      emoji: post.data.emoji || '📝',
      readTime: post.data.readTime || '',
    }));

    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch articles' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, tag, description, date, emoji, content } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

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

    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');

    // Ensure directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    const filePath = path.join(blogDir, `${slug}.md`);
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return new Response(
      JSON.stringify({ success: true, slug, path: filePath }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
