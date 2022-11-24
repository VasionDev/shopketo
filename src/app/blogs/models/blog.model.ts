export interface Blog {
  id: number;
  title: string;
  description: string[];
  content: string;
  imageUrl: string;
  slug: string;
  authorId: number;
  categoryIds: number[];
  tags: string[];
}
