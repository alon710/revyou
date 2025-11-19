"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, Crown, UserMinus, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { removeTeamMember, changeTeamMemberRole } from "@/lib/actions/team.actions";
import type { TeamMember } from "@/lib/actions/team.actions";

interface TeamManagementProps {
  accountId: string;
  teamMembers: TeamMember[];
  currentUserId: string;
  currentUserRole: "owner" | "member";
}

export function TeamManagement({ accountId, teamMembers, currentUserId, currentUserRole }: TeamManagementProps) {
  const t = useTranslations("dashboard.team");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [_, setChangingRoleUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveMember = async () => {
    if (!removingUserId) return;

    try {
      setIsLoading(true);
      await removeTeamMember(accountId, removingUserId);
      toast.success(t("memberRemoved"));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("removeFailed");
      toast.error(message);
    } finally {
      setIsLoading(false);
      setRemovingUserId(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: "owner" | "member") => {
    try {
      setIsLoading(true);
      await changeTeamMemberRole(accountId, userId, newRole);
      toast.success(t("roleChanged"));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("roleChangeFailed");
      toast.error(message);
    } finally {
      setIsLoading(false);
      setChangingRoleUserId(null);
    }
  };

  const isOwner = currentUserRole === "owner";

  return (
    <>
      <DashboardCard title={t("title")} description={t("description")} icon={<Users className="h-5 w-5" />}>
        <div className="space-y-3">
          {teamMembers.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const memberName = member.displayName || member.email;

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {memberName}
                      {isCurrentUser && <span className="text-muted-foreground text-sm ml-2">({t("you")})</span>}
                    </p>
                    {member.role === "owner" && <Crown className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={member.role === "owner" ? "default" : "secondary"} className="text-xs">
                      {member.role === "owner" ? t("roleOwner") : t("roleMember")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t("joinedOn", { date: new Date(member.addedAt).toLocaleDateString() })}
                    </span>
                  </div>
                </div>

                {isOwner && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === "member" && (
                        <DropdownMenuItem onClick={() => handleChangeRole(member.userId, "owner")}>
                          <Crown className="mr-2 h-4 w-4" />
                          {t("makeOwner")}
                        </DropdownMenuItem>
                      )}
                      {member.role === "owner" && (
                        <DropdownMenuItem onClick={() => handleChangeRole(member.userId, "member")}>
                          <Shield className="mr-2 h-4 w-4" />
                          {t("makeMember")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setRemovingUserId(member.userId)}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        {t("removeMember")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}

          {teamMembers.length === 0 && <p className="text-center text-muted-foreground py-8">{t("noMembers")}</p>}
        </div>
      </DashboardCard>

      <AlertDialog open={removingUserId !== null} onOpenChange={() => setRemovingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("removeConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? t("removing") : t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
