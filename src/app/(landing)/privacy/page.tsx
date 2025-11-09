export default function PrivacyPage() {
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">מדיניות פרטיות</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. מבוא</h2>
            <p className="text-muted-foreground leading-relaxed">
              מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך כאשר אתה משתמש בשירות תשובות
              AI. אנו מחויבים להגן על פרטיותך ולשמור על אבטחת המידע שלך.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. מידע שאנו אוספים</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">אנו אוספים מספר סוגים של מידע:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6">
              <li>מידע אישי: שם, כתובת דוא&quot;ל, מספר טלפון</li>
              <li>מידע עסקי: פרטי עסק, Google Business Profile</li>
              <li>תוכן: ביקורות, תשובות, הגדרות מערכת</li>
              <li>מידע טכני: כתובת IP, סוג דפדפן, מערכת הפעלה</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. שימוש במידע</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6">
              <li>אספקת ותפעול השירות</li>
              <li>יצירת תשובות אוטומטיות לביקורות</li>
              <li>שיפור ופיתוח השירות</li>
              <li>תקשורת עם משתמשים</li>
              <li>אבטחה ומניעת הונאות</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. אבטחת מידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו משתמשים באמצעי אבטחה מתקדמים כדי להגן על המידע שלך, כולל הצפנת נתונים, אימות OAuth 2.0 עם Google,
              ואחסון מאובטח ב-Firebase. עם זאת, שום שיטת העברה או אחסון אינה בטוחה ב-100%.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. שיתוף מידע עם צדדים שלישיים</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו לא משתפים את המידע האישי שלך עם צדדים שלישיים, למעט:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6 mt-4">
              <li>Google (עבור Google Business Profile API)</li>
              <li>Gemini AI (עבור יצירת תשובות)</li>
              <li>ספקי שירותי תשתית (Firebase, Cloud Storage)</li>
              <li>כאשר נדרש על פי חוק</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. זכויות המשתמש</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">לך יש את הזכויות הבאות בנוגע למידע האישי שלך:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 me-6">
              <li>גישה למידע האישי שלך</li>
              <li>תיקון מידע לא מדויק</li>
              <li>מחיקת המידע שלך</li>
              <li>הגבלת עיבוד המידע</li>
              <li>ניידות נתונים</li>
              <li>התנגדות לעיבוד מידע</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. קובצי Cookie</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו משתמשים בקובצי Cookie ובטכנולוגיות דומות לשיפור חווית המשתמש, לניתוח תנועה באתר ולמטרות אבטחה. ניתן
              לנהל את העדפות ה-Cookie דרך הגדרות הדפדפן שלך.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. שמירת מידע</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו שומרים את המידע האישי שלך כל עוד חשבונך פעיל או כנדרש למטרות השירות. לאחר מחיקת החשבון, המידע יימחק
              בהתאם למדיניות השמירה שלנו ולדרישות החוק.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. שינויים במדיניות</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. נודיע לך על שינויים משמעותיים דרך האתר או בדוא&quot;ל. המשך
              השימוש בשירות לאחר שינויים מהווה הסכמה למדיניות המעודכנת.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. צור קשר</h2>
            <p className="text-muted-foreground leading-relaxed">
              לשאלות או בקשות הנוגעות למדיניות הפרטיות או למימוש זכויותיך, ניתן ליצור קשר:
            </p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p>
                דוא&quot;ל:{" "}
                <a href="mailto:alon710@gmail.com" className="text-primary hover:underline">
                  alon710@gmail.com
                </a>
              </p>
              <p>
                טלפון:{" "}
                <a href="tel:+972-50-671-5060" className="text-primary hover:underline">
                  050-671-5060
                </a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">עדכון אחרון: {new Date().toLocaleDateString("he-IL")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
