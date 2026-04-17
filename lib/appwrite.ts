import { Client, Databases, Storage, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6989d52a000d7d636ea8');

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export const PROJECT_ID = '6989d52a000d7d636ea8';
export const DATABASE_ID = '6989fca50035ccde437a';
export const COLLECTION_ID = 'fairy';
export const GALLERY_COLLECTION_ID = 'gallerie';
export const BUCKET_ID = '698dad88000372c2fe4c';
