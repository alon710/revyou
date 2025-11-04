"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Unplug, LogOut, ChevronDown, User } from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { DisconnectAccountsDialog } from "@/components/dashboard/accounts/DisconnectAccountsDialog";
import { useSidebar } from "./Sidebar";
import Image from "next/image";

export function SidebarUserMenu() {
  const { user } = useAuth();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) return null;

  // Collapsed: icon only
  if (isCollapsed) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
            >
              {user.photoURL ? (
                <Image
                  width={32}
                  height={32}
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="left"
            className="w-[200px] [direction:rtl]"
          >
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full flex-row-reverse">
                <span>הגדרות משתמש</span>
                <Settings className="h-4 w-4" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setDisconnectDialogOpen(true)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full flex-row-reverse">
                <span>ניתוק חשבונות</span>
                <Unplug className="h-4 w-4" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <div className="flex items-center gap-2 w-full flex-row-reverse">
                <span>התנתק</span>
                <LogOut className="h-4 w-4" />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DisconnectAccountsDialog
          open={disconnectDialogOpen}
          onOpenChange={setDisconnectDialogOpen}
        />
      </>
    );
  }

  // Expanded: full button with user info
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between [direction:rtl] h-auto py-2"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex flex-col items-end flex-1 min-w-0">
                <span className="font-medium text-sm truncate w-full text-right">
                  {user.displayName || "משתמש"}
                </span>
                {user.email && (
                  <span className="text-xs text-muted-foreground truncate w-full text-right">
                    {user.email}
                  </span>
                )}
              </div>

              {user.photoURL ? (
                <Image
                  width={32}
                  height={32}
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="rounded-full w-8 h-8 object-cover shrink-0"
                />
              ) : (
                <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 mr-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          className="w-[220px] [direction:rtl]"
        >
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full flex-row-reverse">
              <span>הגדרות משתמש</span>
              <Settings className="h-4 w-4" />
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setDisconnectDialogOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full flex-row-reverse">
              <span>ניתוק חשבונות</span>
              <Unplug className="h-4 w-4" />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <div className="flex items-center gap-2 w-full flex-row-reverse">
              <span>התנתק</span>
              <LogOut className="h-4 w-4" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DisconnectAccountsDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
      />
    </>
  );
}
