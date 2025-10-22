'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Building2,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ברוך הבא, {user.displayName || 'משתמש'}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            סקירה כללית של ביקורות ותשובות AI שלך
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Reviews Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                ביקורות החודש
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                אין ביקורות חדשות
              </p>
            </CardContent>
          </Card>

          {/* AI Replies Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                תשובות שנוצרו
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                תשובות AI החודש
              </p>
            </CardContent>
          </Card>

          {/* Response Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                אחוז תגובה
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                מכלל הביקורות
              </p>
            </CardContent>
          </Card>

          {/* Average Rating Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                דירוג ממוצע
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.0</div>
              <p className="text-xs text-muted-foreground">
                מתוך 5 כוכבים
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>התחל עכשיו</CardTitle>
            <CardDescription>
              צעדים ראשונים להפעלת המערכת
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Button
              asChild
              size="lg"
              className="h-auto flex-col items-start gap-2 p-6 text-right"
            >
              <Link href="/businesses">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <span className="font-semibold">חבר עסק</span>
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">
                      חבר את חשבון Google Business שלך
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto flex-col items-start gap-2 p-6 text-right"
            >
              <Link href="/reviews">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-semibold">צפה בביקורות</span>
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">
                      נהל ביקורות ותשובות AI
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Connected Businesses Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>עסקים מחוברים</CardTitle>
                <CardDescription>
                  העסקים שלך ב-Google Business Profile
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/businesses" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>הוסף עסק</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                עדיין לא חיברת עסקים
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                חבר את חשבון Google Business שלך כדי להתחיל לקבל תשובות אוטומטיות לביקורות
              </p>
              <Button asChild>
                <Link href="/businesses">
                  חבר עסק ראשון
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>ביקורות אחרונות</CardTitle>
                <CardDescription>
                  הביקורות האחרונות שהתקבלו
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/reviews" className="gap-2">
                  <span>צפה בהכל</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                אין ביקורות עדיין
              </h3>
              <p className="text-sm text-muted-foreground">
                ברגע שתחבר עסק ותתחיל לקבל ביקורות, הן יופיעו כאן
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
