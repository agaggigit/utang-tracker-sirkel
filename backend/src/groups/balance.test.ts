import { describe, it, expect } from "vitest";
import { computeBalances } from "./balance";

describe("computeBalances", () => {
  it("anggota lain berutang ke aku kalau aku yang menalangi", () => {
    const expenses = [
      {
        id: "e1",
        description: "Makan siang",
        paidBy: "aku",
        paidByUser: { id: "aku", name: "Aku" },
        shares: [
          { userId: "aku", shareAmount: 50000, user: { id: "aku", name: "Aku" } },
          { userId: "budi", shareAmount: 50000, user: { id: "budi", name: "Budi" } },
        ],
      },
    ];

    const result = computeBalances(expenses, "aku");

    expect(result.totalOwedToMe).toBe(50000);
    expect(result.owedToMe[0].userId).toBe("budi");
  });
});