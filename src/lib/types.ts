export interface Document {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  parentDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentNode extends Document {
  children: DocumentNode[];
}
