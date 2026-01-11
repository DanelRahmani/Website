import fs from 'fs';
import path from 'path';
import RSS from 'rss';
import { notesApi } from './src/lib/notesApi';

async function buildRss() {
  const feed = new RSS({
    title: 'Danel Rahmani',
    site_url: 'https://danelrahmani.com',
    feed_url: 'https://danelrahmani.com/rss.xml',
  });

  // Fetch all notes from Notion
  const allPosts = await notesApi.getNotes();

  allPosts.forEach((post) => {
    feed.item({
      title: post.title,
      url: `https://danelrahmani.com/notes/${post.slug}`,
      date: post.publishedAt,
      description: post.description,
    });
  });

  // Write RSS XML to public folder
  const filePath = path.join(process.cwd(), 'public', 'rss.xml');
  fs.writeFileSync(filePath, feed.xml({ indent: true }));
  console.log('✅ RSS feed generated at public/rss.xml');
}

buildRss().catch((err) => {
  console.error('Failed to generate RSS feed:', err);
  process.exit(1);
});
