export type AddCommentDto = {
  content: string;
  parentCommentId?: string;
};

export type EditCommentDto = {
  content: string;
};