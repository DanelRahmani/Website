import { GetStaticPaths, GetStaticProps } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';

import { PageLayout } from '../../components/PageLayout';
import { NotePreview } from '../../components/notes/NotePreview';
import { Note, notesApi } from '../../lib/notesApi';

const seoTitle = 'Tags';
const seoDescription = 'All of my blog posts tagged with ';

interface Props {
  tag: string;
  relatedNotes: Note[];
}

export default function Tag({ tag, relatedNotes }: Props) {
  return (
    <>
      <NextSeo
        title={seoTitle}
        description={`${seoDescription}#${tag}`}
        canonical={`${process.env.NEXT_PUBLIC_URL}/tags/${tag}`}
        openGraph={{
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_URL}/api/og?title=${seoTitle}&description=${seoDescription}`,
            },
          ],
        }}
      />
      <PageLayout title="Tags" intro={`All the articles from #${tag}`}>
        <div className="mt-24 md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {relatedNotes.map((note) => (
              <NotePreview key={note.slug} note={note} />
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
}

// Fetch notes by tag at build time
export const getStaticProps: GetStaticProps<Props, { tag: string }> = async ({ params }) => {
  try {
    const tag = params?.tag!;
    const relatedNotes = await notesApi.getNotesByTag(tag);

    return {
      props: {
        tag,
        relatedNotes,
      },
    };
  } catch (err: any) {
    console.error('Failed to fetch notes by tag:', err);
    return { notFound: true }; // build continues even if Notion fails
  }
};

// Pre-generate paths for all tags
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const tags = await notesApi.getAllTags(); // fetch all tags from Notion
    const paths = tags.map((tag) => ({ params: { tag } }));

    return {
      paths,
      fallback: false, // required for static export
    };
  } catch (err: any) {
    console.error('Failed to fetch static paths for tags:', err);
    return {
      paths: [], // build still succeeds
      fallback: false,
    };
  }
};
