import { NextApiHandler } from 'next';
import RSS from 'rss';

import { notesApi } from '../../lib/notesApi';

const rss: NextApiHandler = async (req, res) => {
  const feed = new RSS({
    title: 'Danel Rahmani',
    site_url: 'https://danelrahmani.com/',
    feed_url: 'https://danelrahmani.com/rss.xml',
  });

  let allPosts = [] as any[];
  try {
    allPosts = await notesApi.getNotes();
  } catch (err: any) {
    console.error('Failed to generate RSS feed:', err);
    // If Notion is not configured, return an empty feed instead of 500
    if (err?.message?.includes('Notion not configured')) {
      res.setHeader('Content-Type', 'text/xml');
      res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');
      res.write(feed.xml({ indent: true }));
      res.end();
      return;
    }

    res.status(500).end('Failed to generate RSS feed');
    return;
  }

  allPosts.map((post) => {
    feed.item({
      title: post.title,
      url: `https://danelrahmani.com/notes/${post.slug}`,
      date: post.publishedAt,
      description: post.description,
    });
  });

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');
  res.write(feed.xml({ indent: true }));
  res.end();
};

export default rss;
