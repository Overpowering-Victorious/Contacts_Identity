import db from '../config/db';

export type LinkPrecedence = 'primary' | 'secondary';

export interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: LinkPrecedence;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const findContactsByEmailOrPhone = async (
  email?: string,
  phoneNumber?: string
): Promise<Contact[]> => {
  return db<Contact>('contacts')
    .where((builder) => {
      if (email) builder.orWhere('email', email);
      if (phoneNumber) builder.orWhere('phoneNumber', phoneNumber);
    })
    .andWhere('deletedAt', null);
};

export const createContact = async (contact: Partial<Contact>): Promise<Contact> => {
  const [newContact] = await db<Contact>('contacts')
    .insert(contact)
    .returning('*');
  return newContact;
};

export const updateContact = async (id: number, updates: Partial<Contact>): Promise<void> => {
  await db<Contact>('contacts')
    .where({ id })
    .update({ ...updates, updatedAt: new Date().toISOString() });
};