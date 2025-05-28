import db from '../config/db';
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
  // Find any contacts matching this email or phone
  const existing = await findContactsByEmailOrPhone(email, phoneNumber);

  // No existing matches: create a new primary
  if (existing.length === 0) {
    const newPrimary = await createContact({ email, phoneNumber });
    return {
      primaryContactId: newPrimary.id,
      emails: [email!],
      phoneNumbers: [phoneNumber!],
      secondaryContactIds: [],
    };
  }

  // Identify all primary contacts among the matches
  const primaries = existing.filter((c) => c.linkPrecedence === 'primary');

  // Determine the true primary: the oldest primary by creation date
  let primary = primaries.reduce((a, b) =>
    new Date(a.created_at) < new Date(b.created_at) ? a : b
  );

  // If there are multiple primary records, convert the others to secondary
  for (const p of primaries) {
    if (p.id !== primary.id) {
      await updateContact(p.id, {
        linkPrecedence: 'secondary',
        linkedId: primary.id,
      });
    }
  }

  const primaryId = primary.id;

  // Re-fetch all related contacts (primary + secondaries)
  const related: Contact[] = await db<Contact>('contacts')
    .where('deletedAt', null)
    .andWhere(function () {
      this.where('id', primaryId)
        .orWhere('linkedId', primaryId)
        .orWhere('email', email!)  // include direct email matches
        .orWhere('phoneNumber', phoneNumber!); // include direct phone matches
    });

  // Consolidate unique emails and phone numbers
  const emails = Array.from(
    new Set(related.map((c) => c.email).filter(Boolean) as string[])
  );
  const phones = Array.from(
    new Set(related.map((c) => c.phoneNumber).filter(Boolean) as string[])
  );
  const secondaryIds = related
    .filter((c) => c.linkPrecedence === 'secondary')
    .map((c) => c.id);

  // If this exact combination hasn't been recorded, add as a new secondary
  const existsExact = related.some(
    (c) => c.email === email && c.phoneNumber === phoneNumber
  );
  if (!existsExact) {
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