import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

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
    console.log("👤 Creating user document...");
    await db
      .collection("users")
      .doc(USER_ID)
      .set({
        uid: USER_ID,
        email: "alon710@gmail.com",
        displayName: "Alon",
        createdAt: Timestamp.fromDate(new Date("2024-01-01")),
      });
    console.log("✅ User created\n");

    console.log("🏢 Creating location documents...");

    const businessLocation1 = {
      googleAccountId: "google_account_123",
      googleLocationId: "location_123",
      name: "מסעדת חמישים ושמונה",
      address: "רחוב הרצל 58, תל אביב",
      photoUrl: "https://example.com/photos/restaurant_58.jpg",
      connected: true,
      connectedAt: Timestamp.fromDate(new Date("2024-01-15")),
      emailOnNewReview: true,
      config: {
        locationDescription: "מסעדה איטלקית משפחתית המגישה פיצות ופסטות טריות",
        toneOfVoice: "friendly",
        useEmojis: true,
        languageMode: "hebrew",
        starConfigs: {
          1: {
            autoReply: false,
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
            autoReply: false,
            customInstructions: "הודה בהתלהבות והזמן לבקר שוב",
          },
        },
      },
    };

    const businessLocation2 = {
      googleAccountId: "google_account_456",
      googleLocationId: "location_456",
      name: "בית קפה המלך ג'ורג'",
      address: "רחוב המלך ג'ורג' 25, ירושלים",
      photoUrl: "https://example.com/photos/king_george_cafe.jpg",
      connected: true,
      connectedAt: Timestamp.fromDate(new Date("2024-02-01")),
      emailOnNewReview: true,
      config: {
        locationDescription: "בית קפה בוטיק עם קפה איכותי ועוגות תוצרת בית",
        toneOfVoice: "professional",
        useEmojis: false,
        languageMode: "hebrew",
        starConfigs: {
          1: {
            autoReply: false,
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
            autoReply: false,
            customInstructions: "הודה והדגש את המחויבות לשירות",
          },
        },
      },
    };

    await db
      .collection("users")
      .doc(USER_ID)
      .collection("locations")
      .doc("location_test_001")
      .set(businessLocation1);
    console.log("✅ Location 1 created: מסעדת חמישים ושמונה");

    await db
      .collection("users")
      .doc(USER_ID)
      .collection("locations")
      .doc("location_test_002")
      .set(businessLocation2);
    console.log("✅ Location 2 created: בית קפה המלך ג'ורג'\n");

    console.log("⭐ Creating review documents...");

    const reviews = [
      {
        id: "google_review_123",
        googleReviewId: "google_review_123",
        name: "שרה כהן",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_1.jpg",
        rating: 5,
        date: Timestamp.fromDate(getDaysAgo(20)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(20), 5)),
        aiReply:
          "תודה רבה שרה על המילים החמות! ❤️ אנחנו שמחים מאוד שנהניתם מהפיצה ומהשירות. נשמח לארח אתכם שוב בקרוב! 🥂\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(20), 6)),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_124",
        googleReviewId: "google_review_124",
        name: "דוד לוי",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_2.jpg",
        rating: 1,
        text: "חוויה איומה. הפסטה הגיעה קרה והשירות היה איטי מאוד. לא ממליץ.",
        date: Timestamp.fromDate(getDaysAgo(18)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(18), 5)),
        aiReply:
          "היי דוד, אנחנו מצטערים מאוד לשמוע על החוויה הלא נעימה. 🙏 זה לא מייצג את הסטנדרטים שלנו. נשמח אם תיצור איתנו קשר בטלפון 03-1234567 כדי שנוכל לפצות על כך עם ארוחה חינם בפעם הבאה.\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(18), 6)),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_125",
        googleReviewId: "google_review_125",
        name: "מיכל אברהם",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_3.jpg",
        rating: 4,
        text: "אוכל טוב מאוד, אבל היה קצת רועש. בסך הכל נהננו.",
        date: Timestamp.fromDate(getDaysAgo(22)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(22), 5)),
        aiReply:
          "תודה רבה מיכל על המשוב! ✨ אנחנו שמחים שנהניתם מהאוכל. נקח בחשבון את ההערה לגבי הרעש ונשתדל לשפר.\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(22), 6)),
        replyStatus: "posted",
        postedReply:
          "תודה רבה מיכל על המשוב! ✨ אנחנו שמחים שנהניתם מהאוכל. נקח בחשבון את ההערה לגבי הרעש ונשתדל לשפר.\n\nבברכה,\nצוות חמישים ושמונה",
        postedAt: Timestamp.fromDate(addMinutes(getDaysAgo(22), 60)),
        postedBy: USER_ID,
      },
      {
        id: "google_review_126",
        googleReviewId: "google_review_126",
        name: "יוסי מזרחי",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_4.jpg",
        rating: 3,
        text: "בסדר, לא מיוחד. הציפיתי ליותר בהתחשב בביקורות.",
        date: Timestamp.fromDate(getDaysAgo(15)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(15), 5)),
        aiReply:
          "היי יוסי, תודה על המשוב! נשמח לשמוע מה היה אפשר לעשות טוב יותר.\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(15), 6)),
        replyStatus: "posted",
        postedReply:
          "היי יוסי, תודה על המשוב הכן! אנחנו תמיד משתדלים להשתפר. נשמח מאוד אם תיתן לנו הזדמנות נוספת להרשים אותך בפעם הבאה. 🙏\n\nבברכה,\nצוות חמישים ושמונה",
        postedAt: Timestamp.fromDate(addMinutes(getDaysAgo(15), 60)),
        postedBy: USER_ID,
      },
      {
        id: "google_review_127",
        googleReviewId: "google_review_127",
        name: "רחל גולדשטיין",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_5.jpg",
        rating: 5,
        text: "מקום נפלא עם אוכל מצוין!",
        date: Timestamp.fromDate(getDaysAgo(10)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(10), 5)),
        aiReply:
          "תודה רבה רחל! ❤️ נשמח לראותך שוב בקרוב!\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(10), 6)),
        replyStatus: "posted",
        postedReply:
          "תודה רבה רחל! ❤️ נשמח לראותך שוב בקרוב!\n\nבברכה,\nצוות חמישים ושמונה",
        postedAt: Timestamp.fromDate(addMinutes(getDaysAgo(10), 30)),
        postedBy: USER_ID,
      },
      {
        id: "google_review_201",
        googleReviewId: "google_review_201",
        name: "אבי שמעון",
        photoUrl: "https://example.com/photos/king_george_cafe_reviewer_1.jpg",
        rating: 5,
        text: "הקפה הכי טוב בעיר!",
        date: Timestamp.fromDate(getDaysAgo(7)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(7), 5)),
        aiReply:
          "תודה רבה על המילים החמות. נשמח לארח אותך שוב בקרוב.\n\nבברכה, צוות בית הקפה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(7), 6)),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_202",
        googleReviewId: "google_review_202",
        name: "דנה כץ",
        photoUrl: "https://example.com/photos/king_george_cafe_reviewer_2.jpg",
        rating: 4,
        text: "קפה טעים מאוד, אבל הייתה המתנה ארוכה.",
        date: Timestamp.fromDate(getDaysAgo(3)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(3), 5)),
        aiReply:
          "תודה רבה על המשוב. אנחנו שמחים שנהנית מהקפה ומתנצלים על ההמתנה. נעבוד על שיפור זמני ההמתנה.\n\nבברכה, צוות בית הקפה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(3), 6)),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_128",
        googleReviewId: "google_review_128",
        name: "אלון ברזילי",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_1.jpg",
        rating: 5,
        text: "פיצה מדהימה! אחלה של מקום",
        date: Timestamp.fromDate(getDaysAgo(1)),
        receivedAt: Timestamp.fromDate(addMinutes(getDaysAgo(1), 5)),
        aiReply:
          "תודה רבה אלון! 🥂 נשמח לראותך שוב!\n\nבברכה,\nצוות חמישים ושמונה",
        aiReplyGeneratedAt: Timestamp.fromDate(addMinutes(getDaysAgo(1), 6)),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_auto_001",
        googleReviewId: "google_review_auto_001",
        name: "נועה לוי",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_auto.jpg",
        rating: 5,
        text: "השירות היה מצוין והאוכל טעים מאוד! חוויה נהדרת, ממליצה בחום!",
        date: Timestamp.fromDate(new Date()),
        receivedAt: Timestamp.fromDate(new Date()),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_auto_002",
        googleReviewId: "google_review_auto_002",
        name: "משה כהן",
        photoUrl: "https://example.com/photos/restaurant_58_reviewer_auto2.jpg",
        rating: 2,
        text: "האוכל היה בסדר אבל שירות לקוי. חיכינו הרבה זמן לאוכל.",
        date: Timestamp.fromDate(new Date()),
        receivedAt: Timestamp.fromDate(new Date()),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
      {
        id: "google_review_auto_003",
        googleReviewId: "google_review_auto_003",
        name: "תמר אוחנה",
        photoUrl: "https://example.com/photos/king_george_cafe_auto.jpg",
        rating: 4,
        text: "קפה איכותי ומקום נעים. אבל קצת יקר.",
        date: Timestamp.fromDate(new Date()),
        receivedAt: Timestamp.fromDate(new Date()),
        replyStatus: "pending",
        postedReply: null,
        postedAt: null,
        postedBy: null,
      },
    ];

    const location1Reviews = reviews.filter((r) =>
      [
        "google_review_123",
        "google_review_124",
        "google_review_125",
        "google_review_126",
        "google_review_127",
        "google_review_128",
        "google_review_auto_001",
        "google_review_auto_002",
      ].includes(r.id)
    );

    for (const review of location1Reviews) {
      const { id, ...reviewData } = review;
      await db
        .collection("users")
        .doc(USER_ID)
        .collection("locations")
        .doc("location_test_001")
        .collection("reviews")
        .doc(id)
        .set(reviewData);
      console.log(
        `✅ Review created: ${id} (${review.rating}⭐) - מסעדת חמישים ושמונה`
      );
    }

    const location2Reviews = reviews.filter((r) =>
      [
        "google_review_201",
        "google_review_202",
        "google_review_auto_003",
      ].includes(r.id)
    );

    for (const review of location2Reviews) {
      const { id, ...reviewData } = review;
      await db
        .collection("users")
        .doc(USER_ID)
        .collection("locations")
        .doc("location_test_002")
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
    console.log("  - 2 Locations");
    console.log("  - 11 Reviews total:");
    console.log("    - 8 with existing AI replies (manual flow test data)");
    console.log(
      "    - 3 WITHOUT AI replies (will trigger automation when Cloud Functions deployed)"
    );
    console.log(
      "\n💡 Note: User is on FREE tier. Subscribe via Stripe to upgrade to Basic/Pro."
    );
    console.log("\n🤖 AUTOMATION TEST DATA:");
    console.log(
      "  - google_review_auto_001: 5-star review (Restaurant) - will auto-generate AI reply"
    );
    console.log(
      "  - google_review_auto_002: 2-star review (Restaurant) - will auto-generate AI reply"
    );
    console.log(
      "  - google_review_auto_003: 4-star review (Café) - will auto-generate AI reply"
    );
    console.log("\n📧 Both locations have emailOnNewReview: true");
    console.log(
      "   Email notifications will be sent when AI replies are generated."
    );
    console.log("\n🎉 You can now test all pages in your application!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => {
    console.log("\n✅ Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });
