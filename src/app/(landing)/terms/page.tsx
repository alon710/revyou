const LAST_UPDATED_DATE = new Date("2025-11-09").toLocaleDateString("he-IL");

export default function TermsPage() {
  return (
    <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">תנאי שימוש</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. כללי</h2>
            <p className="text-muted-foreground leading-relaxed">
              תנאי השימוש הבאים מסדירים את השימוש שלך בשירות תשובות AI. השימוש בשירות מהווה הסכמה מלאה לתנאים אלו. אנא
              קרא את התנאים בעיון לפני השימוש בשירות.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. השירות</h2>
            <p className="text-muted-foreground leading-relaxed">
              השירות מספק פתרון AI לניהול ותשובות אוטומטיות לביקורות לקוחות בפלטפורמת Google Business Profile. השירות
              כולל יצירת תשובות מותאמות אישית, ניהול עסקים, ואפשרויות פרסום אוטומטי.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. שימוש מותר</h2>
            <p className="text-muted-foreground leading-relaxed">
              אתה מתחייב להשתמש בשירות אך ורק למטרות חוקיות ובהתאם לתנאים אלה. אסור להשתמש בשירות בדרך שעלולה לפגוע
              בשירות או להפריע לשימוש של משתמשים אחרים.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. חשבון משתמש</h2>
            <p className="text-muted-foreground leading-relaxed">
              אתה אחראי לשמירה על סודיות פרטי החשבון שלך ולכל הפעילויות המתבצעות תחת חשבונך. עליך להודיע לנו מיד על כל
              שימוש לא מורשה בחשבונך.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. תשלום והחזרים</h2>
            <p className="text-muted-foreground leading-relaxed">
              התשלום עבור השירות מתבצע על פי התוכנית שנבחרה. המחירים כפופים לשינוי בהתראה מראש. מדיניות ההחזרים תפורט
              בנפרד.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. קניין רוחני</h2>
            <p className="text-muted-foreground leading-relaxed">
              כל זכויות הקניין הרוחני בשירות ובתוכן שלו שייכות לנו או למעניקי הרישיון שלנו. אסור להעתיק, לשנות או להפיץ
              את התוכן ללא אישור מפורש בכתב.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. הגבלת אחריות</h2>
            <p className="text-muted-foreground leading-relaxed">
              השירות מסופק &quot;כמות שהוא&quot; ללא אחריות מכל סוג. איננו אחראים לכל נזק ישיר או עקיף הנובע מהשימוש או
              מאי היכולת להשתמש בשירות.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. שינויים בתנאים</h2>
            <p className="text-muted-foreground leading-relaxed">
              אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת. שינויים יכנסו לתוקף מיד עם פרסומם באתר. המשך
              השימוש בשירות לאחר שינויים מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. צור קשר</h2>
            <p className="text-muted-foreground leading-relaxed">
              לשאלות או הבהרות לגבי תנאי השימוש, ניתן ליצור קשר בכתובת:{" "}
              <a href="mailto:alon710@gmail.com" className="text-primary hover:underline">
                alon710@gmail.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">עדכון אחרון: {LAST_UPDATED_DATE}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
