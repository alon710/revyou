import { Body, Button, Container, Head, Heading, Hr, Html, Section, Text, Column, Row } from "@react-email/components";
import * as React from "react";

export interface WeeklySummaryEmailProps {
  title: string;
  dateRange: string;
  businessName: string;

  statsTitle: string;
  totalReviewsLabel: string;
  averageRatingLabel: string;
  totalReviews: number;
  averageRating: string;

  positiveThemesTitle: string;
  positiveThemes: string[];

  negativeThemesTitle: string;
  negativeThemes: string[];

  recommendationsTitle: string;
  recommendations: string[];

  viewDashboardButton: string;
  dashboardUrl: string;
  footer: string;

  locale: "en" | "he";
}

export default function WeeklySummaryEmail({
  title,
  dateRange,
  businessName,
  statsTitle,
  totalReviewsLabel,
  averageRatingLabel,
  totalReviews,
  averageRating,
  positiveThemesTitle,
  positiveThemes,
  negativeThemesTitle,
  negativeThemes,
  recommendationsTitle,
  recommendations,
  viewDashboardButton,
  dashboardUrl,
  footer,
  locale,
}: WeeklySummaryEmailProps) {
  const dir = locale === "he" ? "rtl" : "ltr";
  const fontFamily =
    locale === "he"
      ? "Rubik, 'Segoe UI', Helvetica, Arial, sans-serif"
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const primary = "#2A5E77";
  const bgOuter = "#F4F3EE";
  const bgContent = "#FFFFFF";
  const textDark = "#141414";
  const borderSoft = "#E2E2E0";

  const positiveColor = "#10b981";
  const negativeColor = "#ef4444";
  const recommendationColor = "#3b82f6";

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: bgOuter,
          fontFamily,
        }}
      >
        <Container
          style={{
            margin: "40px auto",
            maxWidth: "600px",
            backgroundColor: bgContent,
            borderRadius: "12px",
            border: `1px solid ${borderSoft}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <Section
            style={{
              backgroundColor: primary,
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <Heading
              style={{
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {title}
            </Heading>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "16px",
                margin: "8px 0 0 0",
              }}
            >
              {businessName} • {dateRange}
            </Text>
          </Section>

          <Section style={{ padding: "32px 24px", color: textDark }}>
            <Section
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                padding: "20px",
                border: `1px solid ${borderSoft}`,
                marginBottom: "32px",
              }}
            >
              <Heading
                as="h3"
                style={{
                  fontSize: "18px",
                  margin: "0 0 16px 0",
                  color: textDark,
                }}
              >
                {statsTitle}
              </Heading>
              <Row>
                <Column style={{ textAlign: "center", borderRight: `1px solid ${borderSoft}` }}>
                  <Text style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: primary }}>
                    {totalReviews}
                  </Text>
                  <Text style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>{totalReviewsLabel}</Text>
                </Column>
                <Column style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: primary }}>
                    {averageRating}
                  </Text>
                  <Text style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>{averageRatingLabel}</Text>
                </Column>
              </Row>
            </Section>

            {positiveThemes.length > 0 && (
              <Section style={{ marginBottom: "24px" }}>
                <Heading as="h3" style={{ fontSize: "18px", margin: "0 0 12px 0", color: textDark }}>
                  <span style={{ color: positiveColor, marginInlineEnd: "8px" }}>●</span>
                  {positiveThemesTitle}
                </Heading>
                <ul style={{ paddingInlineStart: "20px", margin: 0 }}>
                  {positiveThemes.map((theme, i) => (
                    <li key={i} style={{ marginBottom: "8px", fontSize: "16px", lineHeight: "1.5" }}>
                      {theme}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {negativeThemes.length > 0 && (
              <Section style={{ marginBottom: "24px" }}>
                <Heading as="h3" style={{ fontSize: "18px", margin: "0 0 12px 0", color: textDark }}>
                  <span style={{ color: negativeColor, marginInlineEnd: "8px" }}>●</span>
                  {negativeThemesTitle}
                </Heading>
                <ul style={{ paddingInlineStart: "20px", margin: 0 }}>
                  {negativeThemes.map((theme, i) => (
                    <li key={i} style={{ marginBottom: "8px", fontSize: "16px", lineHeight: "1.5" }}>
                      {theme}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {recommendations.length > 0 && (
              <Section style={{ marginBottom: "32px" }}>
                <Heading as="h3" style={{ fontSize: "18px", margin: "0 0 12px 0", color: textDark }}>
                  <span style={{ color: recommendationColor, marginInlineEnd: "8px" }}>●</span>
                  {recommendationsTitle}
                </Heading>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#EFF6FF",
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "15px",
                        lineHeight: "1.5",
                        marginBottom: "8px",
                        color: "#1e3a8a",
                      }}
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section style={{ textAlign: "center", paddingTop: "8px" }}>
              <Button
                href={dashboardUrl}
                style={{
                  backgroundColor: primary,
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "14px 48px",
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                {viewDashboardButton}
              </Button>
            </Section>
          </Section>

          <Section style={{ padding: "0 24px 24px 24px" }}>
            <Hr style={{ borderColor: borderSoft, margin: "0 0 16px 0" }} />
            <Text
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#6b7280",
                textAlign: "center",
                margin: 0,
              }}
            >
              {footer}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

WeeklySummaryEmail.PreviewProps = {
  title: "סיכום שבועי",
  dateRange: "17 נוב - 23 נוב",
  businessName: "עסק לדוגמה",
  statsTitle: "סקירה שבועית",
  totalReviewsLabel: "סה״כ ביקורות",
  averageRatingLabel: "דירוג ממוצע",
  totalReviews: 15,
  averageRating: "4.8",
  positiveThemesTitle: "נקודות חוזק",
  positiveThemes: ["שירות מעולה ומהיר", "אוכל טעים", "אווירה נעימה"],
  negativeThemesTitle: "נקודות לשיפור",
  negativeThemes: ["זמן המתנה ארוך בערב", "מוזיקה רועשת מדי"],
  recommendationsTitle: "המלצות לפעולה",
  recommendations: [
    "כדאי להוסיף עוד מלצר במשמרת ערב",
    "מומלץ להנמיך את המוזיקה בשעות העומס",
    "המשיכו לשמור על רמת השירות הגבוהה",
  ],
  viewDashboardButton: "מעבר ללוח הבקרה",
  dashboardUrl: "https://www.bottie.ai",
  footer: "נשלח באמצעות Bottie",
  locale: "he",
} as WeeklySummaryEmailProps;
