import { Request, Response, RequestHandler } from 'express';
import { reconcileIdentity } from '../services/reconciliationService';


export const identify: RequestHandler = async (req, res): Promise<void> => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    res.status(400).json({ error: 'Either email or phoneNumber is required.' });
    return;
  }

  try {
    const result = await reconcileIdentity(email, phoneNumber);
    res.status(200).json({ contact: result });
    return;
  } catch (err) {
    console.error('Error in identify:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};