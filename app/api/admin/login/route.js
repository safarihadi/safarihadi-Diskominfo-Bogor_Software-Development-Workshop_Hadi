import { NextResponse } from "next/server";
import { sequelize, Admin, initializeDatabase } from "@/lib/sequelize";
import bcrypt from "bcryptjs";

let dbInitialized = false;

const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function POST(request) {
  try {
    await initDB();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find admin by email (case-insensitive); do not hard-filter is_active to avoid NULL mismatch
    const admin = await Admin.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("email")),
        email.toLowerCase()
      ),
      attributes: ["username", "password", "email"],
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Check password: support bcrypt-hashed or plaintext legacy
    let isPasswordValid = false;
    try {
      // If admin.password looks like a bcrypt hash, compare properly
      if (typeof admin.password === "string" && admin.password.startsWith("$2")) {
        isPasswordValid = await bcrypt.compare(password, admin.password);
      } else {
        // Fallback: plain text comparison
        isPasswordValid = password === admin.password;
      }
    } catch (_) {
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Return admin data (without password)
    const adminData = {
      username: admin.username,
      email: admin.email,
    };

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      admin: adminData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
