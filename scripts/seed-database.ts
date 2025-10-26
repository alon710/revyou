import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Initialize Firebase Admin
if (getApps().length === 0) {
  const privateKey =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    console.error("⚠️  Missing FIREBASE_ADMIN_PRIVATE_KEY in .env.local");
    process.exit(1);
  }

  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL;

  if (!clientEmail) {
    console.error("⚠️  Missing FIREBASE_ADMIN_CLIENT_EMAIL in .env.local");
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// Replace this with your actual Firebase Auth user ID
const USER_ID = process.env.TEST_USER_ID || "YOUR_USER_UID";

if (USER_ID === "YOUR_USER_UID") {
  console.error(
    "⚠️  Please set TEST_USER_ID environment variable in .env.local"
  );
  console.error(
    "   You can find your user ID in Firebase Auth console or by logging in"
  );
  process.exit(1);
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // 1. Seed User
    console.log("👤 Creating user document...");
    await db
      .collection("users")
      .doc(USER_ID)
      .set({
        uid: USER_ID,
        email: "test@example.com",
        createdAt: Timestamp.fromDate(new Date("2024-01-01")),
        notificationPreferences: {
          emailOnNewReview: true,
        },
      });
    console.log("✅ User created\n");

    // 2. Seed Businesses
    console.log("🏢 Creating business documents...");

    const business1 = {
      googleAccountId: "google_account_123",
      googleLocationId: "location_123",
      name: "מסעדת חמישים ושמונה",
      address: "רחוב הרצל 58, תל אביב",
      photoUrl: "https://lh3.googleusercontent.com/p/test",
      connected: true,
      connectedAt: Timestamp.fromDate(new Date("2024-01-15")),
      notificationsEnabled: true,
      config: {
        businessDescription: "מסעדה איטלקית משפחתית המגישה פיצות ופסטות טריות",
        toneOfVoice: "friendly",
        useEmojis: true,
        languageMode: "hebrew",
        starConfigs: {
          1: {
            autoReply: true,
            customInstructions:
              "התנצל בצורה כנה, הציע פיצוי כמו ארוחה חינם, וספק טלפון ליצירת קשר",
          },
          2: {
            autoReply: true,
            customInstructions: "הכר בבעיה, התנצל, והצע שיפור",
          },
          3: {
            autoReply: true,
            customInstructions: "הודה על המשוב ושאל מה ניתן לשפר",
          },
          4: {
            autoReply: true,
            customInstructions: "הודה חם ושאל מה היה אפשר לעשות טוב יותר",
          },
          5: {
            autoReply: true,
            customInstructions: "הודה בהתלהבות והזמן לבקר שוב",
          },
        },
      },
    };

    const business2 = {
      googleAccountId: "google_account_456",
      googleLocationId: "location_456",
      name: "בית קפה המלך ג'ורג'",
      address: "רחוב המלך ג'ורג' 25, ירושלים",
      photoUrl: "https://lh3.googleusercontent.com/p/test2",
      connected: true,
      connectedAt: Timestamp.fromDate(new Date("2024-02-01")),
      notificationsEnabled: true,
      config: {
        businessDescription: "בית קפה בוטיק עם קפה איכותי ועוגות תוצרת בית",
        toneOfVoice: "professional",
        useEmojis: false,
        languageMode: "hebrew",
        starConfigs: {
          1: {
            autoReply: true,
            customInstructions: "התנצל בצורה פורמלית ומקצועית",
          },
          2: {
            autoReply: true,
            customInstructions: "הכר בבעיה והצע פתרון",
          },
          3: {
            autoReply: true,
            customInstructions: "הודה ושאל על משוב נוסף",
          },
          4: {
            autoReply: true,
            customInstructions: "הודה והזמן לבקר שוב",
          },
          5: {
            autoReply: true,
            customInstructions: "הודה והדגש את המחויבות לשירות",
          },
        },
      },
    };

    await db
      .collection("users")
      .doc(USER_ID)
      .collection("businesses")
      .doc("business_test_001")
      .set(business1);
    console.log("✅ Business 1 created: מסעדת חמישים ושמונה");

    await db
      .collection("users")
      .doc(USER_ID)
      .collection("businesses")
      .doc("business_test_002")
      .set(business2);
    console.log("✅ Business 2 created: בית קפה המלך ג'ורג'\n");

    // 3. Seed Reviews
    console.log("⭐ Creating review documents...");

    const reviews = [
      {
        id: "google_review_123",
        googleReviewId: "google_review_123",
        reviewerName: "שרה כהן",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Sarah+Cohen",
        rating: 5,
        reviewText:
          "חוויה מדהימה! הפיצה הכי טעימה שאכלתי בחיי. השירות מעולה והאווירה נעימה מאוד. בהחלט נחזור!",
        reviewDate: Timestamp.fromDate(new Date("2024-01-20T12:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-01-20T12:05:00")),
        aiReply:
          "תודה רבה שרה על המילים החמות! ❤️ אנחנו שמחים מאוד שנהניתם מהפיצה ומהשירות. נשמח לארח אתכם שוב בקרוב! 🥂\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-01-20T12:06:00")),
        replyStatus: "pending",
        wasEdited: false,
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_124",
        googleReviewId: "google_review_124",
        reviewerName: "דוד לוי",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=David+Levi",
        rating: 1,
        reviewText:
          "חוויה איומה. הפסטה הגיעה קרה והשירות היה איטי מאוד. לא ממליץ.",
        reviewDate: Timestamp.fromDate(new Date("2024-01-21T18:30:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-01-21T18:35:00")),
        aiReply:
          "היי דוד, אנחנו מצטערים מאוד לשמוע על החוויה הלא נעימה. 🙏 זה לא מייצג את הסטנדרטים שלנו. נשמח אם תיצור איתנו קשר בטלפון 03-1234567 כדי שנוכל לפצות על כך עם ארוחה חינם בפעם הבאה.\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-01-21T18:36:00")),
        replyStatus: "pending",
        wasEdited: false,
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_125",
        googleReviewId: "google_review_125",
        reviewerName: "מיכל אברהם",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Michal+Abraham",
        rating: 4,
        reviewText: "אוכל טוב מאוד, אבל היה קצת רועש. בסך הכל נהננו.",
        reviewDate: Timestamp.fromDate(new Date("2024-01-19T20:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-01-19T20:05:00")),
        aiReply:
          "תודה רבה מיכל על המשוב! ✨ אנחנו שמחים שנהניתם מהאוכל. נקח בחשבון את ההערה לגבי הרעש ונשתדל לשפר.\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-01-19T20:06:00")),
        replyStatus: "posted",
        wasEdited: false,
        postedReply:
          "תודה רבה מיכל על המשוב! ✨ אנחנו שמחים שנהניתם מהאוכל. נקח בחשבון את ההערה לגבי הרעש ונשתדל לשפר.\n\nבברכה,\nצוות חמישים ושמונה",
        postedAt: Timestamp.fromDate(new Date("2024-01-19T21:00:00")),
        postedBy: USER_ID,
      },
      {
        id: "google_review_126",
        googleReviewId: "google_review_126",
        reviewerName: "יוסי מזרחי",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Yossi+Mizrahi",
        rating: 3,
        reviewText: "בסדר, לא מיוחד. הציפיתי ליותר בהתחשב בביקורות.",
        reviewDate: Timestamp.fromDate(new Date("2024-01-18T13:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-01-18T13:05:00")),
        aiReply:
          "היי יוסי, תודה על המשוב! נשמח לשמוע מה היה אפשר לעשות טוב יותר.\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-01-18T13:06:00")),
        replyStatus: "posted",
        wasEdited: true,
        editedReply:
          "היי יוסי, תודה על המשוב הכן! אנחנו תמיד משתדלים להשתפר. נשמח מאוד אם תיתן לנו הזדמנות נוספת להרשים אותך בפעם הבאה. 🙏\n\nבברכה,\nצוות חמישים ושמונה",
        postedReply:
          "היי יוסי, תודה על המשוב הכן! אנחנו תמיד משתדלים להשתפר. נשמח מאוד אם תיתן לנו הזדמנות נוספת להרשים אותך בפעם הבאה. 🙏\n\nבברכה,\nצוות חמישים ושמונה",
        postedAt: Timestamp.fromDate(new Date("2024-01-18T14:00:00")),
        postedBy: USER_ID,
      },
      {
        id: "google_review_127",
        googleReviewId: "google_review_127",
        reviewerName: "רחל גולדשטיין",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Rachel+Goldstein",
        rating: 5,
        reviewText: "מקום נפלא עם אוכל מצוין!",
        reviewDate: Timestamp.fromDate(new Date("2024-01-17T15:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-01-17T15:05:00")),
        aiReply:
          "תודה רבה רחל! ❤️ נשמח לראותך שוב בקרוב!\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-01-17T15:06:00")),
        replyStatus: "failed",
        wasEdited: false,
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_201",
        googleReviewId: "google_review_201",
        reviewerName: "אבי שמעון",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Avi+Shimon",
        rating: 5,
        reviewText: "הקפה הכי טוב בעיר!",
        reviewDate: Timestamp.fromDate(new Date("2024-02-05T10:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-02-05T10:05:00")),
        aiReply:
          "תודה רבה על המילים החמות. נשמח לארח אותך שוב בקרוב.\n\nבברכה, צוות בית הקפה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-02-05T10:06:00")),
        replyStatus: "pending",
        wasEdited: false,
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_202",
        googleReviewId: "google_review_202",
        reviewerName: "דנה כץ",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Dana+Katz",
        rating: 4,
        reviewText: "קפה טעים מאוד, אבל הייתה המתנה ארוכה.",
        reviewDate: Timestamp.fromDate(new Date("2024-02-04T14:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-02-04T14:05:00")),
        aiReply:
          "תודה רבה על המשוב. אנחנו שמחים שנהנית מהקפה ומתנצלים על ההמתנה. נעבוד על שיפור זמני ההמתנה.\n\nבברכה, צוות בית הקפה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-02-04T14:06:00")),
        replyStatus: "pending",
        wasEdited: false,
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_128",
        googleReviewId: "google_review_128",
        reviewerName: "אלון ברזילי",
        reviewerPhotoUrl: "https://ui-avatars.com/api/?name=Alon+Barzily",
        rating: 5,
        reviewText: "פיצה מדהימה! אחלה של מקום",
        reviewDate: Timestamp.fromDate(new Date("2024-01-22T19:00:00")),
        receivedAt: Timestamp.fromDate(new Date("2024-01-22T19:05:00")),
        aiReply:
          "תודה רבה אלון! 🥂 נשמח לראותך שוב!\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(new Date("2024-01-22T19:06:00")),
        replyStatus: "rejected",
        wasEdited: false,
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
    ];

    // Reviews for business_test_001
    const business1Reviews = reviews.filter((r) =>
      [
        "google_review_123",
        "google_review_124",
        "google_review_125",
        "google_review_126",
        "google_review_127",
        "google_review_128",
      ].includes(r.id)
    );

    for (const review of business1Reviews) {
      const { id, ...reviewData } = review;
      await db
        .collection("users")
        .doc(USER_ID)
        .collection("businesses")
        .doc("business_test_001")
        .collection("reviews")
        .doc(id)
        .set(reviewData);
      console.log(
        `✅ Review created: ${id} (${review.rating}⭐) - מסעדת חמישים ושמונה`
      );
    }

    // Reviews for business_test_002
    const business2Reviews = reviews.filter((r) =>
      ["google_review_201", "google_review_202"].includes(r.id)
    );

    for (const review of business2Reviews) {
      const { id, ...reviewData } = review;
      await db
        .collection("users")
        .doc(USER_ID)
        .collection("businesses")
        .doc("business_test_002")
        .collection("reviews")
        .doc(id)
        .set(reviewData);
      console.log(
        `✅ Review created: ${id} (${review.rating}⭐) - בית קפה המלך ג'ורג'`
      );
    }
    console.log("\n");

    console.log("✨ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log("  - 1 User (Free Tier)");
    console.log("  - 2 Businesses");
    console.log("  - 8 Reviews (various states)");
    console.log("\n💡 Note: User is on FREE tier. Subscribe via Stripe to upgrade to Basic/Pro.");
    console.log("🎉 You can now test all pages in your application!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("\n✅ Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });
