import {
  Contact,
  createContact,
  findContactsByEmailOrPhone,
  updateContact,
} from '../models/contact';

export interface ReconciliationResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export const reconcileIdentity = async (
  email?: string,
  phoneNumber?: string
): Promise<ReconciliationResponse> => {
  const existing = await findContactsByEmailOrPhone(email, phoneNumber);

  if (existing.length === 0) {
    const newPrimary = await createContact({ email, phoneNumber });
    return {
      primaryContactId: newPrimary.id,
      emails: [email ?? ''],
      phoneNumbers: [phoneNumber ?? ''],
      secondaryContactIds: [],
    };
  }

  const primary = existing.reduce((prev, curr) => {
    if (curr.linkPrecedence === 'primary') return prev.createdAt < curr.createdAt ? prev : curr;
    return prev;
  });

  const primaryId = primary.linkPrecedence === 'primary' ? primary.id : primary.linkedId!;

  const related = existing.filter((c) => c.id === primaryId || c.linkedId === primaryId);
  const emails = Array.from(new Set(related.map((c) => c.email).filter(Boolean))) as string[];
  const phones = Array.from(new Set(related.map((c) => c.phoneNumber).filter(Boolean))) as string[];
  const secondaryIds = related.filter((c) => c.linkPrecedence === 'secondary').map((c) => c.id);

  const isDuplicate = related.some((c) => c.email === email && c.phoneNumber === phoneNumber);

  if (!isDuplicate) {
    await createContact({
      email,
      phoneNumber,
      linkPrecedence: 'secondary',
      linkedId: primaryId,
    });
  }

  return {
    primaryContactId: primaryId,
    emails,
    phoneNumbers: phones,
    secondaryContactIds: secondaryIds,
  };
};