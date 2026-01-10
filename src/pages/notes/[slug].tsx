import { GetStaticPaths, GetStaticProps } from 'next';
import { ArticleJsonLd, NextSeo } from 'next-seo';
import Prism from 'prismjs';
import { useEffect } from 'react';
import Share, { openShare } from '../../components/Share';
import { XIcon } from '../../components/icons/XIcon';
import { NoteLayout } from '../../components/notes/NoteLayout';
import { NotionBlockRenderer } from '../../components/notion/NotionBlockRenderer';
import { Note as NoteType, notesApi } from '../../lib/notesApi';

type Props = {
  note: NoteType;
  noteContent: any[];
};

export default function Note({
  note: { title, description, createdAt, slug },
  noteContent,
  previousPathname,
}: Props & { previousPathname: string }) {
  const url = `${process.env.NEXT_PUBLIC_URL}/notes/${slug}`;
  const openGraphImageUrl = `${process.env.NEXT_PUBLIC_URL}/api/og?title=${title}&description=${description}`;

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          images: [{ url: openGraphImageUrl }],
        }}
      />
      <ArticleJsonLd
        url={url}
        images={[openGraphImageUrl]}
        title={title}
        datePublished={createdAt}
        authorName="Danel Rahmani"
        description={description}
      />
      <NoteLayout
        meta={{ title, description, date: createdAt }}
        previousPathname={previousPathname}
      >
        <div className="pb-32">
          {noteContent.map((block) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}

          <hr />
          <Share title={title} url={url} image={openGraphImageUrl} className="mt-8" />
        </div>
      </NoteLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async (context) => {
  try {
    const slug = context.params?.slug;
    const allNotes = await notesApi.getNotes();
    const note = allNotes.find((note) => note.slug === slug);

    if (!note) {
      return {
        notFound: true,
      };
    }

    const noteContent = await notesApi.getNote(note.id);

    return {
      props: {
        note,
        noteContent,
      },
      revalidate: 10,
    };
  } catch (err: any) {
    console.error('Error in getStaticProps for /notes/[slug]:', err);
    // If app is misconfigured (Notion disabled), surface a clear message
    if (err?.message?.includes('Notion not configured')) {
      throw err;
    }
    throw new Error(`Failed to collect page data for /notes/[slug]: ${err?.message ?? String(err)}`);
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const posts = await notesApi.getNotes();

    return {
      paths: posts.map((post) => ({ params: { slug: post.slug } })),
      fallback: 'blocking',
    };
  } catch (err: any) {
    console.error('Error in getStaticPaths for /notes:', err);
    if (err?.message?.includes('Notion not configured')) {
      throw err;
    }
    throw new Error(`Failed to get static paths for /notes: ${err?.message ?? String(err)}`);
  }
};
