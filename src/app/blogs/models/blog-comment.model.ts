export interface BlogComment {
  blogId: number;
  parentId: number;
  commenter: string;
  comment: string;
  publisheDdate: string;
}
