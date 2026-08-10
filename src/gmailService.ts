export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
}

export interface GmailMessageDetails {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  bodyText?: string;
}

/**
 * Encodes string to UTF-8 RFC 2822 standard email format and returns URL-safe Base64.
 */
function buildRawEmail(to: string, subject: string, bodyText: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 16px;">
      ${bodyText.replace(/\n/g, '<br/>')}
    </div>`
  ];
  const email = emailLines.join('\r\n');
  const base64Encoded = btoa(unescape(encodeURIComponent(email)));
  return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function fetchGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.statusText}`);
  }
  return res.json();
}

export async function listGmailMessages(
  accessToken: string,
  query: string = '',
  maxResults: number = 10
): Promise<GmailMessageItem[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('maxResults', maxResults.toString());
  if (query) {
    url.searchParams.set('q', query);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.statusText}`);
  }
  const data = await res.json();
  return data.messages || [];
}

export async function getGmailMessageDetails(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetails> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.statusText}`);
  }
  const data = await res.json();

  const headers = data.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

  // Simple body extraction
  let bodyText = data.snippet || '';
  if (data.payload?.body?.data) {
    try {
      bodyText = decodeURIComponent(escape(atob(data.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))));
    } catch {
      bodyText = data.snippet;
    }
  } else if (data.payload?.parts) {
    const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
    if (textPart?.body?.data) {
      try {
        bodyText = decodeURIComponent(escape(atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))));
      } catch {
        bodyText = data.snippet;
      }
    }
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet,
    internalDate: data.internalDate,
    subject: getHeader('subject') || '(no subject)',
    from: getHeader('from') || 'Unknown',
    to: getHeader('to') || 'Me',
    date: getHeader('date') || new Date(Number(data.internalDate)).toLocaleString('bn-BD'),
    bodyText,
  };
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<any> {
  const raw = buildRawEmail(to, subject, bodyText);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send email: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function deleteGmailMessage(accessToken: string, messageId: string): Promise<void> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete message: ${res.statusText}`);
  }
}
