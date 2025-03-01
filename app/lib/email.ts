import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendShareNoteEmail(
  toEmail: string,
  fromEmail: string,
  noteTitle: string,
  noteUrl: string
) {
  const params = {
    Source: process.env.AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: `${fromEmail} shared a note with you: ${noteTitle}`,
      },
      Body: {
        Html: {
          Data: `
            <h1>A note has been shared with you</h1>
            <p>${fromEmail} has shared their note "${noteTitle}" with you.</p>
            <p>Click <a href="${noteUrl}">here</a> to view the note.</p>
          `,
        },
      },
    },
  };

  try {
    await ses.send(new SendEmailCommand(params));
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
} 