import { Blog } from './blog.model';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  parentID: number;
  description: string;
  imageUrl: string[];
  blogs: Blog[];
}
