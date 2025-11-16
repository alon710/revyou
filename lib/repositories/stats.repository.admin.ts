import { getAdminDb } from "@/lib/firebase/admin";
import { BaseRepository } from "./base.repository";
import { Timestamp } from "firebase-admin/firestore";
import { startOfMonth } from "date-fns";

interface Stats {}
interface StatsCreate {}
interface StatsUpdate {}

export class StatsRepositoryAdmin extends BaseRepository<StatsCreate, Stats, StatsUpdate> {
  constructor() {
    super("stats");
  }

  async get(_id: string): Promise<Stats | null> {
    throw new Error("Use count methods instead");
  }

  async list(): Promise<Stats[]> {
    throw new Error("Use count methods instead");
  }

  async create(_data: StatsCreate): Promise<Stats> {
    throw new Error("Stats are calculated, not created");
  }

  async update(_id: string, _data: StatsUpdate): Promise<Stats> {
    throw new Error("Stats are calculated, not updated");
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Stats are calculated, not deleted");
  }

  async countUserBusinesses(userId: string): Promise<number> {
    try {
      const accountsRef = getAdminDb().collection(`users/${userId}/accounts`);
      const accountsSnapshot = await accountsRef.get();

      if (accountsSnapshot.empty) {
        return 0;
      }

      let totalBusinessCount = 0;

      for (const accountDoc of accountsSnapshot.docs) {
        const accountId = accountDoc.id;
        const businessesRef = getAdminDb().collection(`users/${userId}/accounts/${accountId}/businesses`);
        const businessesQuery = businessesRef.where("connected", "==", true);
        const countSnapshot = await businessesQuery.count().get();
        totalBusinessCount += countSnapshot.data().count;
      }

      return totalBusinessCount;
    } catch (error) {
      console.error("Error counting user businesses:", error);
      return 0;
    }
  }

  async countUserReviewsThisMonth(userId: string): Promise<number> {
    try {
      const startDate = startOfMonth(new Date());
      const startTimestamp = Timestamp.fromDate(startDate);

      const accountsRef = getAdminDb().collection(`users/${userId}/accounts`);
      const accountsSnapshot = await accountsRef.get();

      if (accountsSnapshot.empty) {
        return 0;
      }

      let totalReviewCount = 0;

      for (const accountDoc of accountsSnapshot.docs) {
        const accountId = accountDoc.id;

        const businessesRef = getAdminDb().collection(`users/${userId}/accounts/${accountId}/businesses`);
        const businessesQuery = businessesRef.where("connected", "==", true);
        const businessesSnapshot = await businessesQuery.get();

        for (const businessDoc of businessesSnapshot.docs) {
          const reviewsRef = getAdminDb().collection(
            `users/${userId}/accounts/${accountId}/businesses/${businessDoc.id}/reviews`
          );
          const reviewsQuery = reviewsRef.where("receivedAt", ">=", startTimestamp);
          const countSnapshot = await reviewsQuery.count().get();
          totalReviewCount += countSnapshot.data().count;
        }
      }

      return totalReviewCount;
    } catch (error) {
      console.error("Error counting user reviews this month:", error);
      return 0;
    }
  }
}
