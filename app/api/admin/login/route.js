import { NextResponse } from "next/server";
import { Admin, initializeDatabase } from "@/lib/sequelize";
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

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await Admin.findOne({
      where: {
        username: username,
        is_active: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Username atau password salah" },
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
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Return admin data (without password)
    const adminData = {
      username: admin.username,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
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
