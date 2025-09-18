import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { sequelize, Submission, initializeDatabase } from "@/lib/sequelize";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function GET(request) {
  try {
    await initDB();

    const url = new URL(request.url);
    const name = url.searchParams.get("name") || url.searchParams.get("nama") || "";
    const orderParam = (url.searchParams.get("order") || "DESC").toUpperCase();
    const sortByParam = (url.searchParams.get("sort_by") || "created_at").toLowerCase();
    const orderDirection = orderParam === "ASC" ? "ASC" : "DESC";

    // Portable case-insensitive search across Postgres/SQLite
    const whereClause = name
      ? sequelize.where(
          sequelize.fn("LOWER", sequelize.col("nama")),
          { [Op.like]: `%${name.toLowerCase()}%` }
        )
      : undefined;

    const orderField = ["created_at", "status"].includes(sortByParam)
      ? sortByParam
      : "created_at";

    const submissions = await Submission.findAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      attributes: [
        "id",
        "tracking_code",
        "nama",
        "jenis_layanan",
        "status",
        "created_at",
        "updated_at",
      ],
    });

    return NextResponse.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Error searching submissions:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}


