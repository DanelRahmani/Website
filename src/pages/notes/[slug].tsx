import { GetStaticPaths, GetStaticProps } from 'next';
import { ArticleJsonLd, NextSeo } from 'next-seo';
import Prism from 'prismjs';
import { useEffect } from 'react';
import Share from '../../components/Share';
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
}: Props) {
  const url = `${process.env.NEXT_PUBLIC_URL}/notes/${slug}`;
  const staticOgImage = `${process.env.NEXT_PUBLIC_URL}/assets/og-placeholder.png`; // static image

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{ images: [{ url: staticOgImage }] }}
      />
      <ArticleJsonLd
        url={url}
        images={[staticOgImage]}
        title={title}
        datePublished={createdAt}
        authorName="Danel Rahmani"
        description={description}
        publisherName="Danel Rahmani"
        publisherLogo="https://danelrahmani.com/assets/danel.jpg"
      />
      <NoteLayout meta={{ title, description, date: createdAt }}>
        <div className="pb-32">
          {noteContent.map((block) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
          <hr />
          <Share title={title} url={url} image={staticOgImage} className="mt-8" />
        </div>
      </NoteLayout>
    </>
  );
}

// Fetch note content at build time
export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({ params }) => {
  try {
    const slug = params?.slug!;
    const allNotes = await notesApi.getNotes(); // fetch all notes from Notion
    const note = allNotes.find((n) => n.slug === slug);

    if (!note) {
      return { notFound: true };
    }

    const noteContent = await notesApi.getNote(note.id);

    return { props: { note, noteContent } };
  } catch (err: any) {
    console.error('Failed to fetch note for static export:', err);
    return { notFound: true };
  }
};

// Pre-generate paths for all notes
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allNotes = await notesApi.getNotes(); // fetch all notes from Notion
    const paths = allNotes.map((note) => ({ params: { slug: note.slug } }));

    return {
      paths,
      fallback: false, // required for static export
    };
  } catch (err: any) {
    console.error('Failed to fetch static paths from Notion:', err);
    return {
      paths: [], // build still succeeds
      fallback: false,
    };
  }
};
