export interface Letter {
    id?: string;
    title: string;
    content: string;
    userId: string;
    status: 'draft' | 'drive';
    googleDriveId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }