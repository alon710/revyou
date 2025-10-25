"use client";

import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "איך המערכת יוצרת תשובות לביקורות?",
    answer:
      "המערכת משתמשת בטכנולוגיית Gemini AI של Google ליצירת תשובות מותאמות אישית. היא לוקחת בחשבון את תיאור העסק שלך, את טון הדיבור שבחרת, את דירוג הכוכבים והוראות ספציפיות שהגדרת לכל סוג ביקורת.",
  },
  {
    question: "האם אני יכול לערוך את התשובות לפני הפרסום?",
    answer:
      "בהחלט! ניתן להגדיר את המערכת לשלושה מצבים: אישור ידני (תבדקו כל תשובה), פרסום אוטומטי מלא, או מצב היברידי שבו תחליטו לפי דירוג הכוכבים. לדוגמה, ביקורות של 4-5 כוכבים יתפרסמו אוטומטית ואילו ביקורות נמוכות יותר ידרשו אישור ידני.",
  },
  {
    question: "האם המערכת תומכת בעברית?",
    answer:
      "כן! המערכת תומכת באופן מלא בעברית ובאנגלית. ניתן להגדיר את שפת התשובות כברירת מחדל, או לבחור במצב 'התאמה אוטומטית' שבו המערכת תזהה את שפת הביקורת ותגיב באותה שפה.",
  },
  {
    question: "כמה זמן לוקח לקבל תשובה אוטומטית?",
    answer:
      "המערכת מקבלת התראה בזמן אמת על ביקורות חדשות דרך Google Pub/Sub. בדרך כלל, תשובה נוצרת תוך 1-2 דקות מרגע שהביקורת מתפרסמת. במצב פרסום אוטומטי, התשובה מתפרסמת מיד לאחר מכן.",
  },
  {
    question: "האם אני יכול להגדיר תשובות שונות לדירוגים שונים?",
    answer:
      "כן! זו אחת התכונות המרכזיות של המערכת. ניתן להגדיר הוראות ספציפיות לכל דירוג כוכבים (1-5). לדוגמה, לביקורת של כוכב אחד תוכלו להגדיר תשובה אמפתית יותר עם הצעת פתרון, בעוד שלביקורת של 5 כוכבים תשובה מודה יותר.",
  },
  {
    question: "מה קורה אם המערכת יוצרת תשובה לא מתאימה?",
    answer:
      "אם הפעלתם מצב אישור ידני, תוכלו לדחות את התשובה או לערוך אותה לפני הפרסום. במקרה של פרסום אוטומטי, תמיד ניתן למחוק את התשובה או לערוך אותה גם אחרי הפרסום. בנוסף, המערכת לומדת מהעריכות שלכם ומשתפרת עם הזמן.",
  },
  {
    question: "האם המערכת בטוחה? מה לגבי פרטיות המידע?",
    answer:
      "המערכת משתמשת באינטגרציה רשמית של Google Business Profile API עם OAuth 2.0, כך שאנחנו לא שומרים את סיסמת Google שלך. כל המידע מוצפן ומאוחסן באופן מאובטח ב-Firebase של Google. אנחנו עומדים בסטנדרטים הגבוהים ביותר של אבטחת מידע ופרטיות.",
  },
  {
    question: "האם אני יכול לנסות את המערכת לפני התשלום?",
    answer:
      "כן! יש לנו תוכנית חינמית שמאפשרת לכם לנהל עסק אחד ועד 5 ביקורות בחודש ללא צורך בכרטיס אשראי. תוכלו לשדרג לתוכנית בתשלום בכל עת.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            מצאו תשובות לשאלות הנפוצות ביותר על המערכת
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-right p-6 flex items-center justify-between hover:bg-secondary/50 transition-all"
              >
                <h3 className="text-lg font-semibold text-foreground pe-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
