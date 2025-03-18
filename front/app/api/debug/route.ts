import { NextResponse } from "next/server";
// API base URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET() {
  try {
    const userId = localStorage?.getItem("ID");
    if (!userId) {
      return NextResponse.json(
        { error: "No user ID found in localStorage" },
        { status: 400 }
      );
    }

    // Get auth token
    const token = localStorage?.getItem("auth_token");
    if (!token) {
      return NextResponse.json(
        { error: "No auth token found in localStorage" },
        { status: 401 }
      );
    }

    // Directly fetch client data using the token
    const clientResponse = await fetch(
      `${API_URL}/client/get-client/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const clientData = await clientResponse.json();

    return NextResponse.json({
      success: true,
      clientData,
      localStorage: {
        ID: localStorage?.getItem("ID"),
        name: localStorage?.getItem("name"),
        email: localStorage?.getItem("email"),
        token: token ? "exists" : "missing",
        userType: localStorage?.getItem("user_type"),
      },
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
