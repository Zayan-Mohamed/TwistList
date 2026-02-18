"use client";

import {
  useTeams,
  useDeleteTeam,
  useLeaveTeam,
  useUser,
  useRequestJoinTeam,
  useAcceptJoinRequest,
  useRejectJoinRequest,
} from "@/lib/hooks";
import { CreateTeamDialog } from "@/components/create-team-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Trash2,
  LogOut,
  CheckCircle2,
  Hand,
  MailQuestion,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { RequestStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const { data: user } = useUser();
  const deleteTeam = useDeleteTeam();
  const leaveTeam = useLeaveTeam();
  const requestJoin = useRequestJoinTeam();
  const acceptRequest = useAcceptJoinRequest();
  const rejectRequest = useRejectJoinRequest();
  const [joiningTeamId, setJoiningTeamId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      deleteTeam.mutate(id, {
        onSuccess: () => toast.success("Team deleted successfully"),
        onError: () => toast.error("Failed to delete team"),
      });
    }
  };

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave your team?")) {
      leaveTeam.mutate(undefined, {
        onSuccess: () => toast.success("Left team successfully"),
        onError: () => toast.error("Failed to leave team"),
      });
    }
  };

  const handleJoinRequest = (teamId: number) => {
    setJoiningTeamId(teamId);
    requestJoin.mutate(teamId, {
      onSuccess: () => {
        toast.success("Join request sent successfully");
        setJoiningTeamId(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to send request");
        setJoiningTeamId(null);
      },
    });
  };

  const handleAcceptRequest = (teamId: number, requestId: number) => {
    acceptRequest.mutate(
      { teamId, requestId },
      {
        onSuccess: () => toast.success("Member accepted successfully"),
        onError: () => toast.error("Failed to accept member"),
      },
    );
  };

  const handleRejectRequest = (teamId: number, requestId: number) => {
    rejectRequest.mutate(
      { teamId, requestId },
      {
        onSuccess: () => toast.success("Request rejected"),
        onError: () => toast.error("Failed to reject request"),
      },
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your teams.
            </p>
          </div>
          <CreateTeamDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams && teams.length > 0 ? (
              teams.map((team) => {
                const isMember = team.users?.some(
                  (u) => u.userId === user?.userId,
                );
                const pendingRequests = team.requests?.filter(
                  (r) => r.status === RequestStatus.PENDING,
                );
                const hasPendingRequests =
                  pendingRequests && pendingRequests.length > 0;

                // Check if the current user has a pending request for this team
                // Since we don't load requests for non-members in findAll unless we change backend,
                // we might not know. But the backend findAll implementation DOES include teamRequests.
                // However, user might see all requests? Ideally only members see requests.
                // Let's check backend service again.
                // Backend returns: teamRequests: { where: { status: 'PENDING' }, include: { user: true } }
                // This means EVERYONE sees pending requests. This is a bit leaky privacy-wise but simple.

                const myPendingRequest = team.requests?.find(
                  (r) =>
                    r.userId === user?.userId &&
                    r.status === RequestStatus.PENDING,
                );

                return (
                  <Card
                    key={team.id}
                    className={`hover:shadow-lg transition-all h-full border-l-4 flex flex-col ${isMember ? "border-l-purple-500 hover:border-l-purple-600 dark:hover:border-l-purple-400" : "border-l-gray-300 dark:border-l-gray-700"}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Users
                            className={`h-5 w-5 ${isMember ? "text-purple-500" : "text-gray-500"}`}
                          />
                          {team.teamName}
                        </CardTitle>
                        {isMember && (
                          <div className="px-2 py-1 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Member
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {isMember ? (
                        <div className="flex flex-col gap-4 mt-auto">
                          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              <span>Manage Members</span>
                            </div>
                            {hasPendingRequests && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                                  >
                                    <MailQuestion className="h-3 w-3 mr-1" />
                                    {pendingRequests.length} Request
                                    {pendingRequests.length > 1 ? "s" : ""}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Join Requests</DialogTitle>
                                    <DialogDescription>
                                      Review requests to join your team.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 mt-2">
                                    {pendingRequests.map((request) => (
                                      <div
                                        key={request.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            {request.user.profilePictureUrl ? (
                                              <Image
                                                src={
                                                  request.user.profilePictureUrl
                                                }
                                                alt=""
                                                className="h-8 w-8 rounded-full"
                                              />
                                            ) : (
                                              <span className="text-xs font-medium">
                                                {request.user.username
                                                  .substring(0, 2)
                                                  .toUpperCase()}
                                              </span>
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium text-sm">
                                              {request.user.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {request.user.email}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() =>
                                              handleRejectRequest(
                                                team.id,
                                                request.id,
                                              )
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() =>
                                              handleAcceptRequest(
                                                team.id,
                                                request.id,
                                              )
                                            }
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          <AddMemberDialog teamId={team.id} />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 mt-auto h-full justify-center text-center text-muted-foreground">
                          {myPendingRequest ? (
                            <div className="flex flex-col items-center gap-2 text-orange-600 dark:text-orange-400">
                              <MailQuestion className="h-8 w-8" />
                              <p className="font-medium">Request Sent</p>
                              <p className="text-xs text-muted-foreground">
                                Waiting for approval...
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">
                                You are not a member of this team.
                              </p>
                              <Button
                                className="w-full gap-2 mt-2"
                                variant="outline"
                                onClick={() => handleJoinRequest(team.id)}
                                disabled={joiningTeamId === team.id}
                              >
                                <Hand className="h-4 w-4" />
                                {joiningTeamId === team.id
                                  ? "Sending..."
                                  : "Request to Join"}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>

                    {isMember && (
                      <CardFooter className="flex justify-between border-t pt-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDelete(team.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                          onClick={handleLeave}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No teams found</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first team.
                </p>
                <CreateTeamDialog />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
