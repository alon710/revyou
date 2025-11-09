import * as React from "react";
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Button } from "@react-email/components";

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

export const ReviewNotificationEmail = ({
  recipientName = "בעל העסק",
  businessName = "העסק שלך",
  accountId = "",
  businessId = "",
  reviewerName = "לקוח",
  rating = 5,
  reviewText = "",
  aiReply = "",
  status = "pending",
  appBaseUrl = "http://localhost:3000",
  reviewId = "",
}: ReviewNotificationEmailProps) => {
  const statusText = status === "pending" ? "ממתינה לאישור" : "פורסמה";
  const statusColor = status === "pending" ? "#f59e0b" : "#10b981";
  const reviewPageUrl = `${appBaseUrl}/dashboard/account/${accountId}/business/${businessId}/reviews/${reviewId}`;

  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>ביקורת חדשה התקבלה!</Heading>
          </Section>

          <Section style={rtlContent}>
            <Text style={greeting}>שלום {recipientName},</Text>
            <Text style={paragraph}>
              התקבלה ביקורת חדשה עבור <strong>{businessName}</strong>
            </Text>

            <Section style={reviewBox}>
              <table style={{ width: "100%", marginBottom: "12px" }}>
                <tr>
                  <td style={{ textAlign: "right" }}>
                    <Text style={reviewerNameStyle}>
                      <strong>{reviewerName}</strong>
                    </Text>
                  </td>
                  <td style={{ textAlign: "left", width: "auto" }}>
                    <span style={starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < rating ? "#fbbf24" : "#d1d5db",
                            fontSize: "24px",
                            marginRight: "2px",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  </td>
                </tr>
              </table>
              {reviewText ? (
                <Text style={reviewContent}>{reviewText}</Text>
              ) : (
                <Text style={emptyReviewPlaceholder}>הלקוח לא השאיר טקסט בביקורת</Text>
              )}
            </Section>

            <Section style={aiReplyBox}>
              <table style={{ width: "100%", marginBottom: "12px" }}>
                <tr>
                  <td style={{ textAlign: "right" }}>
                    <Text style={aiReplyLabelText}>תגובת הבינה המלאכותית</Text>
                  </td>
                  <td style={{ textAlign: "left", width: "auto" }}>
                    <span
                      style={{
                        ...statusBadge,
                        backgroundColor: statusColor,
                      }}
                    >
                      {statusText}
                    </span>
                  </td>
                </tr>
              </table>
              <Text style={aiReplyContent}>{aiReply}</Text>
            </Section>

            <Section style={actionSection}>
              <Button style={button} href={reviewPageUrl}>
                צפייה בביקורת
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>קיבלת הודעת דוא״ל זו כי הפעלת התראות עבור ביקורות חדשות</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: 'Rubik, "Segoe UI", sans-serif, -apple-system, BlinkMacSystemFont',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  maxWidth: "600px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const header = {
  background: "linear-gradient(135deg, #6366f1, #818cf8)",
  padding: "32px 24px",
  textAlign: "center" as const,
};

const h1 = {
  direction: "rtl" as const,
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: "700",
  margin: 0,
};

const rtlContent = {
  direction: "rtl" as const,
  textAlign: "right" as const,
  padding: "32px 24px",
  color: "#1f2937",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "500",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const reviewBox = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  border: "1px solid #d1d5db",
};

const reviewerNameStyle = {
  fontSize: "20px",
  color: "#111827",
  marginBottom: "8px",
  fontWeight: "600",
};

const starsRow = {
  display: "inline-flex",
  direction: "ltr" as const,
  verticalAlign: "middle",
};

const reviewContent = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#111827",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const emptyReviewPlaceholder = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#9ca3af",
  margin: "0",
  fontStyle: "italic",
};

const aiReplyBox = {
  backgroundColor: "#eef2ff",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  border: "1px solid #c7d2fe",
};

const aiReplyLabelText = {
  direction: "rtl" as const,
  fontSize: "14px",
  fontWeight: "600",
  color: "#3730a3",
  margin: "0",
};

const statusBadge = {
  direction: "rtl" as const,
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "600",
};

const aiReplyContent = {
  backgroundColor: "#ffffff",
  padding: "16px",
  borderRadius: "6px",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#1e3a8a",
  whiteSpace: "pre-wrap" as const,
  border: "1px solid #dbeafe",
};

const actionSection = {
  textAlign: "center" as const,
  marginTop: "8px",
};

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 48px",
  display: "inline-block",
  minWidth: "250px",
  textAlign: "center" as const,
};

const footer = {
  padding: "0 24px 24px 24px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "0 0 16px 0",
};

const footerText = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0",
};

export default ReviewNotificationEmail;
