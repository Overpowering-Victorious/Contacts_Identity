import db from '../config/db';

export type LinkPrecedence = 'primary' | 'secondary';

export interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: LinkPrecedence;
  created_at: string;
  updated_at: string;
  deletedAt: string | null;
}

// Find contacts by matching email or phone number
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

// Create a new contact (primary or secondary)
export const createContact = async (
  contact: {
    email?: string;
    phoneNumber?: string;
    linkPrecedence?: LinkPrecedence;
    linkedId?: number;
  }
): Promise<Contact> => {
  const [newContact] = await db<Contact>('contacts')
    .insert({
      email: contact.email ?? null,
      phoneNumber: contact.phoneNumber ?? null,
      linkPrecedence: contact.linkPrecedence ?? 'primary',
      linkedId: contact.linkedId ?? null,
    })
    .returning('*');
  return newContact;
};

// Update existing contact fields with proper datetime
export const updateContact = async (
  id: number,
  updates: {
    linkPrecedence?: LinkPrecedence;
    linkedId?: number;
  }
): Promise<void> => {
  const dbUpdates: Partial<Record<string, any>> = {};
  if (updates.linkPrecedence !== undefined) {
    dbUpdates.linkPrecedence = updates.linkPrecedence;
  }
  if (updates.linkedId !== undefined) {
    dbUpdates.linkedId = updates.linkedId;
  }
  // Use database's current timestamp
  dbUpdates.updated_at = db.fn.now();

  await db<Contact>('contacts')
    .where({ id })
    .update(dbUpdates);
};