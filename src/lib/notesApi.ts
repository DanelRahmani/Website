// @ts-nocheck
import { Client, isFullPage } from '@notionhq/client';
import { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { compareAsc, compareDesc } from 'date-fns';
import { getPlaiceholder } from 'plaiceholder';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const hasNotionConfig = Boolean(NOTION_TOKEN && NOTION_DATABASE_ID);

if (!hasNotionConfig) {
  // Informational only; we avoid throwing here so other parts of the site can build
  console.warn(
    'Notion integration disabled: set NOTION_TOKEN and NOTION_DATABASE_ID environment variables to enable notes.'
  );
}

const notion = hasNotionConfig ? new Client({ auth: NOTION_TOKEN }) : (null as unknown as Client);

export type Note = {
  id: string;
  createdAt: string;
  lastEditedAt: string;
  coverImage: string | null;
  tags: string[];
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string;
  inProgress: boolean;
};

const noop = async (block: BlockObjectResponse) => block;

/**
 * Union type of all block types
 * @see https://developers.notion.com/reference/block
 */
type BlockType = BlockObjectResponse['type'];

/**
 * Lookup table for transforming block types
 * Allows to transform an api response for a specific block type into a more usable format
 */
const BlockTypeTransformLookup: Record<
  BlockType,
  (block: BlockObjectResponse) => Promise<BlockObjectResponse>
> = {
  file: noop,
  paragraph: noop,
  heading_1: noop,
  heading_2: noop,
  heading_3: noop,
  bulleted_list_item: noop,
  numbered_list_item: noop,
  quote: noop,
  to_do: noop,
  toggle: noop,
  template: noop,
  synced_block: noop,
  child_page: noop,
  child_database: noop,
  equation: noop,
  code: noop,
  callout: noop,
  divider: noop,
  breadcrumb: noop,
  table_of_contents: noop,
  column_list: noop,
  column: noop,
  link_to_page: noop,
  table: noop,
  table_row: noop,
  embed: noop,
  bookmark: noop,
  image: async (block: any) => {
    const contents = block[block.type];
    const buffer = await fetch(contents[contents.type].url).then(async (res) =>
      Buffer.from(await res.arrayBuffer()),
    );
    const {
      base64,
      metadata: { height, width },
    } = await getPlaiceholder(buffer, { size: 64 });
    block.image['size'] = { height, width };
    block.image['placeholder'] = base64;

    return block;
  },
  video: noop,
  pdf: noop,
  audio: noop,
  link_preview: noop,
  unsupported: noop,
};

const CompareFunctionLookup = {
  asc: compareAsc,
  desc: compareDesc,
};

class NotesApi {
  private readonly disabled: boolean;
  constructor(
    private readonly notion: Client | null,
    private readonly databaseId?: string,
  ) {
    this.disabled = !this.notion || !this.databaseId;
  }

  private ensureEnabled() {
    if (this.disabled) {
      throw new Error(
        'Notion not configured: set NOTION_TOKEN and NOTION_DATABASE_ID environment variables to enable notes. See README.'
      );
    }
  }

  async getNotes(sortOrder: 'asc' | 'desc' = 'desc', limit?: number) {
    this.ensureEnabled();
    const notes = await this.getDatabaseContent(this.databaseId!);

    return notes
      .sort((a, b) => {
        return CompareFunctionLookup[sortOrder](new Date(a.publishedAt), new Date(b.publishedAt));
      })
      .slice(0, limit);
  }

  async getNotesByTag(tag: string, sortOrder: 'asc' | 'desc' = 'desc', limit?: number) {
    this.ensureEnabled();
    const notes = await notesApi.getNotes(sortOrder, limit);
    const relatedNotes = notes.filter((post) => post.tags.includes(tag));

    return relatedNotes;
  }

  async getNote(id: string) {
    this.ensureEnabled();
    return this.getPageContent(id);
  }

  async getAllTags() {
    this.ensureEnabled();
    const posts = await notesApi.getNotes();

    return Array.from(new Set(posts.map((note) => note.tags).flat()));
  }

  private getDatabaseContent = async (databaseId: string): Promise<Note[]> => {
    try {
      const db = await this.notion!.databases.query({ database_id: databaseId });

      while (db.has_more && db.next_cursor) {
        const { results, has_more, next_cursor } = await this.notion!.databases.query({
          database_id: databaseId,
          start_cursor: db.next_cursor,
        });
        db.results = [...db.results, ...results];
        db.has_more = has_more;
        db.next_cursor = next_cursor;
      }

      return db.results
        .map((page) => {
          if (!isFullPage(page)) {
            throw new Error('Notion page is not a full page');
          }

          return {
            id: page.id,
            createdAt: page.created_time,
            lastEditedAt: page.last_edited_time,
            coverImage: page.cover?.type === 'external' ? page.cover.external.url : null,
            tags:
              'multi_select' in page.properties.hashtags
                ? page.properties.hashtags.multi_select.map((tag) => tag.name)
                : [],
            title: 'title' in page.properties.title ? page.properties.title.title[0].plain_text : '',
            description:
              'rich_text' in page.properties.description
                ? page.properties.description.rich_text[0].plain_text
                : '',
            slug:
              'rich_text' in page.properties.slug ? page.properties.slug.rich_text[0].plain_text : '',
            isPublished:
              'checkbox' in page.properties.published ? page.properties.published.checkbox : false,
            publishedAt:
              'date' in page.properties.publishedAt ? page.properties.publishedAt.date!.start : '',
            inProgress:
              'checkbox' in page.properties.inProgress ? page.properties.inProgress.checkbox : false,
          };
        })
        .filter((post) => post.isPublished);
    } catch (err: any) {
      throw new Error(`Failed to query Notion database (id=${databaseId}): ${err?.message ?? String(err)}`);
    }
  };

  private getPageContent = async (pageId: string) => {
    try {
      const blocks = await this.getBlocks(pageId);

      const blocksChildren = await Promise.all(
        blocks.map(async (block) => {
          const { id } = block;
          const contents = block[block.type as keyof typeof block] as any;
          if (!['unsupported', 'child_page'].includes(block.type) && block.has_children) {
            contents.children = await this.getBlocks(id);
          }

          return block;
        }),
      );

      return Promise.all(
        blocksChildren.map(async (block) => {
          return BlockTypeTransformLookup[block.type as BlockType](block);
        }),
      ).then((blocks) => {
        return blocks.reduce((acc: any, curr) => {
          if (curr.type === 'bulleted_list_item') {
            if (acc[acc.length - 1]?.type === 'bulleted_list') {
              acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
            } else {
              acc.push({
                type: 'bulleted_list',
                bulleted_list: { children: [curr] },
              });
            }
          } else if (curr.type === 'numbered_list_item') {
            if (acc[acc.length - 1]?.type === 'numbered_list') {
              acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
            } else {
              acc.push({
                type: 'numbered_list',
                numbered_list: { children: [curr] },
              });
            }
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);
      });
    } catch (err: any) {
      throw new Error(`Failed to fetch page content (id=${pageId}): ${err?.message ?? String(err)}`);
    }
  };

  private getBlocks = async (blockId: string) => {
    const list = await this.notion.blocks.children.list({
      block_id: blockId,
    });

    while (list.has_more && list.next_cursor) {
      const { results, has_more, next_cursor } = await this.notion.blocks.children.list({
        block_id: blockId,
        start_cursor: list.next_cursor,
      });
      list.results = list.results.concat(results);
      list.has_more = has_more;
      list.next_cursor = next_cursor;
    }

    return list.results as BlockObjectResponse[];
  };
}

export const notesApi = new NotesApi(notion, process.env.NOTION_DATABASE_ID);
