/**
 * Generate HTML email for review notification
 * Plain HTML template to avoid Next.js build issues with react-email
 */

interface ReviewNotificationEmailProps {
  recipientName: string;
  businessName: string;
  accountId: string;
  businessId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  aiReply: string;
  status: "pending" | "posted";
  appBaseUrl: string;
  reviewId: string;
}

export function generateReviewNotificationEmail(props: ReviewNotificationEmailProps): string {
  const {
    recipientName,
    businessName,
    accountId,
    businessId,
    reviewerName,
    rating,
    reviewText,
    aiReply,
    status,
    appBaseUrl,
    reviewId,
  } = props;

  const statusText = status === "pending" ? "ממתינה לאישור" : "פורסמה";
  const statusColor = status === "pending" ? "#f59e0b" : "#10b981";
  const reviewPageUrl = `${appBaseUrl}/dashboard/account/${accountId}/business/${businessId}/reviews/${reviewId}`;

  const stars = Array.from({ length: 5 })
    .map(
      (_, i) =>
        `<span style="color: ${i < rating ? "#fbbf24" : "#d1d5db"}; font-size: 24px; margin-right: 2px;">★</span>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Rubik, 'Segoe UI', sans-serif, -apple-system, BlinkMacSystemFont;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #818cf8); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; direction: rtl;">ביקורת חדשה התקבלה!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="direction: rtl; text-align: right; padding: 32px 24px; color: #1f2937;">
              <p style="font-size: 18px; font-weight: 500; margin: 0 0 16px 0;">שלום ${recipientName},</p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                התקבלה ביקורת חדשה עבור <strong>${businessName}</strong>
              </p>

              <!-- Review Box -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #d1d5db;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="text-align: right;">
                          <p style="font-size: 20px; color: #111827; margin: 0 0 8px 0; font-weight: 600;">
                            <strong>${reviewerName}</strong>
                          </p>
                        </td>
                        <td style="text-align: left; width: auto; direction: ltr;">
                          ${stars}
                        </td>
                      </tr>
                    </table>
                    ${
                      reviewText
                        ? `<p style="font-size: 16px; line-height: 1.6; color: #111827; margin: 0; white-space: pre-wrap;">${reviewText}</p>`
                        : `<p style="font-size: 15px; line-height: 1.6; color: #9ca3af; margin: 0; font-style: italic;">הלקוח לא השאיר טקסט בביקורת</p>`
                    }
                  </td>
                </tr>
              </table>

              <!-- AI Reply Box -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #eef2ff; border-radius: 8px; margin-bottom: 24px; border: 1px solid #c7d2fe;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="text-align: right;">
                          <p style="direction: rtl; font-size: 14px; font-weight: 600; color: #3730a3; margin: 0;">תגובת הבינה המלאכותית</p>
                        </td>
                        <td style="text-align: left; width: auto;">
                          <span style="direction: rtl; display: inline-block; padding: 3px 10px; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 600; background-color: ${statusColor};">
                            ${statusText}
                          </span>
                        </td>
                      </tr>
                    </table>
                    <div style="background-color: #ffffff; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #1e3a8a; white-space: pre-wrap; border: 1px solid #dbeafe;">
                      ${aiReply}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <a href="${reviewPageUrl}" style="background-color: #6366f1; border-radius: 12px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 48px; display: inline-block; min-width: 250px; text-align: center;">
                      צפייה בביקורת
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <hr style="border-color: #e5e7eb; margin: 0 0 16px 0;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center; margin: 0;">
                קיבלת הודעת דוא״ל זו כי הפעלת התראות עבור ביקורות חדשות
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
