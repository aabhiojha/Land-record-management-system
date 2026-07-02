import type { DocumentType } from '@/types/document';

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'LALPURJA', label: 'Lalpurja (Land Certificate)' },
  { value: 'NAAPI_NAKSHA', label: 'Naapi Naksha (Survey Map)' },
  { value: 'CITIZENSHIP', label: 'Citizenship' },
  { value: 'OTHER', label: 'Other' },
];
