export interface Document {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  category: string | null;
  parentDocumentId: string | null;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentNode extends Document {
  children: DocumentNode[];
}
