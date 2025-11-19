export interface ReviewNotificationEmailProps {
  title: string;
  greeting: string;
  body: string;
  noReviewText: string;
  aiReplyHeader: string;
  statusText: string;
  viewReviewButton: string;
  footer: string;

  reviewerName: string;
  rating: number;
  reviewText: string;
  aiReply: string;
  status: "pending" | "posted";
  reviewPageUrl: string;

  locale: "en" | "he";
}

export function ReviewNotificationEmail(props: ReviewNotificationEmailProps): string {
  const {
    title,
    greeting,
    body,
    noReviewText,
    aiReplyHeader,
    statusText,
    viewReviewButton,
    footer,
    reviewerName,
    rating,
    reviewText,
    aiReply,
    status,
    reviewPageUrl,
    locale,
  } = props;

  const isRTL = locale === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const textAlign = isRTL ? "right" : "left";
  const statusColor = status === "pending" ? "#f59e0b" : "#10b981";
  const fontFamily = isRTL
    ? "Rubik, 'Segoe UI', sans-serif, -apple-system, BlinkMacSystemFont"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const stars = Array.from({ length: 5 })
    .map(
      (_, i) =>
        `<span style="color: ${i < rating ? "#fbbf24" : "#d1d5db"}; font-size: 24px; margin-${isRTL ? "left" : "right"}: 2px;">★</span>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: ${fontFamily};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #818cf8); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; direction: ${dir};">${title}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="direction: ${dir}; text-align: ${textAlign}; padding: 32px 24px; color: #1f2937;">
              <p style="font-size: 18px; font-weight: 500; margin: 0 0 16px 0;">${greeting}</p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">${body}</p>

              <!-- Review Box -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #d1d5db;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="text-align: ${textAlign};">
                          <p style="font-size: 20px; color: #111827; margin: 0 0 8px 0; font-weight: 600;">
                            <strong>${reviewerName}</strong>
                          </p>
                        </td>
                        <td style="text-align: ${isRTL ? "left" : "right"}; width: auto; direction: ltr;">
                          ${stars}
                        </td>
                      </tr>
                    </table>
                    ${
                      reviewText
                        ? `<p style="font-size: 16px; line-height: 1.6; color: #111827; margin: 0; white-space: pre-wrap;">${reviewText}</p>`
                        : `<p style="font-size: 15px; line-height: 1.6; color: #9ca3af; margin: 0; font-style: italic;">${noReviewText}</p>`
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
                        <td style="text-align: ${textAlign};">
                          <p style="direction: ${dir}; font-size: 14px; font-weight: 600; color: #3730a3; margin: 0;">${aiReplyHeader}</p>
                        </td>
                        <td style="text-align: ${isRTL ? "left" : "right"}; width: auto;">
                          <span style="direction: ${dir}; display: inline-block; padding: 3px 10px; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 600; background-color: ${statusColor};">
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
                      ${viewReviewButton}
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
                ${footer}
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
