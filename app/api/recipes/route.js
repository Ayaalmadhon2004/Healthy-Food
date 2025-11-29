// app/api/recipes/route.js
import { NextResponse } from "next/server";
import { getRecipes } from "../../lib/recipes"; // ← المسار النسبي الصحيح

export async function GET() {
  const recipes = await getRecipes();
  return NextResponse.json(recipes);
}
