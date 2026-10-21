import { after, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanup, createUser, hasDatabase, prisma, resetRevalidated, revalidated, signInAs } from "./helpers/db.js";
import { getAllReportsAction, submitAreaReportAction } from "../app/actions/reportActions.ts";
import { checkOrgAccess, getCurrentUserRole } from "../app/actions/authActions.ts";
import { readFileSync } from "node:fs";
import { createLoginSchema, createSignupSchema } from "../lib/validations/auth.ts";

const serverMessages = JSON.parse(readFileSync(new URL("../locales/en.json", import.meta.url), "utf8")).server;
const loginSchema = createLoginSchema(serverMessages);
const signupSchema = createSignupSchema(serverMessages);

after(cleanup);
afterEach(() => signInAs(null));

function form(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) fd.set(k, v);
  return fd;
}

// submitAreaReportAction redirects on success, which Next implements by throwing.
async function submit(fd) {
  try {
    return { returned: await submitAreaReportAction(fd) };
  } catch (error) {
    return { redirected: error.redirectUrl };
  }
}

describe("reportActions (real Postgres)", { skip: !hasDatabase && "DATABASE_URL is not set" }, () => {
  it("requires a signed-in user", async () => {
    signInAs(null);
    assert.deepEqual(await submit(form({ areaName: "A", description: "B" })), { returned: { error: "Unauthorized" } });
  });

  it("rejects missing, blank, non-text and oversized fields without writing", async () => {
    const user = await createUser();
    signInAs(user);
    const bad = [
      {},
      { areaName: "A" },
      { description: "B" },
      { areaName: "   ", description: "B" },
      { areaName: "A", description: "\n\t " },
      { areaName: "x".repeat(201), description: "B" },
      { areaName: "A", description: "y".repeat(2001) },
    ];
    for (const fields of bad) {
      assert.deepEqual(await submit(form(fields)), { returned: { error: "Invalid data" } }, JSON.stringify(fields).slice(0, 60));
    }
    const file = new Blob(["x"]);
    const fd = new FormData();
    fd.set("areaName", file);
    fd.set("description", "B");
    assert.deepEqual(await submit(fd), { returned: { error: "Invalid data" } });
    assert.equal(await prisma.areaReport.count({ where: { userId: user.id } }), 0);
  });

  it("stores a valid report as pending for the session user, then redirects", async () => {
    const user = await createUser();
    signInAs(user);
    resetRevalidated();
    // Exactly at the limits.
    const result = await submit(form({ areaName: "x".repeat(200), description: "y".repeat(2000) }));
    assert.deepEqual(result, { redirected: "/dashboard?success=true" });
    assert.ok(revalidated().includes("/dashboard"));

    const rows = await prisma.areaReport.findMany({ where: { userId: user.id } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "pending");
    assert.equal(rows[0].areaName.length, 200);
  });

  it("only ORG and ADMIN can list reports, and each report carries the author's name and email", async () => {
    const author = await createUser("USER");
    signInAs(author);
    await submit(form({ areaName: "North camp", description: "No water" }));

    for (const viewer of [null, await createUser("USER")]) {
      signInAs(viewer);
      assert.deepEqual(await getAllReportsAction(), { success: false, error: "Unauthorized" });
    }

    for (const role of ["ORG", "ADMIN"]) {
      signInAs(await createUser(role));
      const res = await getAllReportsAction();
      assert.equal(res.success, true, role);
      const mine = res.reports.find((r) => r.userId === author.id);
      assert.equal(mine.areaName, "North camp");
      assert.deepEqual(mine.user, { name: author.name, email: author.email });
    }
  });
});

describe("authActions (real Postgres)", { skip: !hasDatabase && "DATABASE_URL is not set" }, () => {
  it("reports the role stored in the database, defaulting to USER when signed out", async () => {
    signInAs(null);
    assert.equal(await getCurrentUserRole(), "USER");
    assert.equal(await checkOrgAccess(), false);

    for (const [role, isOrg] of [["USER", false], ["ORG", true], ["ADMIN", true]]) {
      signInAs(await createUser(role));
      assert.equal(await getCurrentUserRole(), role);
      assert.equal(await checkOrgAccess(), isOrg, role);
    }
  });

  it("a session for a user that is not in the database gets no privileges", async () => {
    signInAs({ id: "ghost-user-not-in-db" });
    assert.equal(await getCurrentUserRole(), "USER");
    assert.equal(await checkOrgAccess(), false);
  });
});

describe("auth validation schemas", () => {
  it("login normalises the email and requires both fields", () => {
    const ok = loginSchema.safeParse({ email: "Aya@Example.COM", password: "x" });
    assert.equal(ok.success, true);
    assert.equal(ok.data.email, "aya@example.com");
    const padded = loginSchema.safeParse({ email: "  Aya@Example.COM \n", password: "x" });
    assert.ok(padded.success, "surrounding whitespace is trimmed, not rejected");
    assert.equal(padded.data.email, "aya@example.com");
    for (const input of [{}, { email: "", password: "x" }, { email: "   ", password: "x" }, { email: "nope", password: "x" }, { email: "a@b.co", password: "" }]) {
      assert.equal(loginSchema.safeParse(input).success, false, JSON.stringify(input));
    }
  });

  it("signup enforces name length and password strength", () => {
    const base = { name: "Aya", email: "aya@example.com", password: "Str0ng!pass" };
    const ok = signupSchema.safeParse({ ...base, name: "  Aya  ", email: "AYA@Example.com" });
    assert.equal(ok.success, true);
    assert.equal(ok.data.name, "Aya");
    assert.equal(ok.data.email, "aya@example.com");
    assert.ok(signupSchema.safeParse({ ...base, email: " aya@example.com " }).success, "padded signup email is trimmed");

    const bad = [
      { name: "A" },
      { name: "n".repeat(51) },
      { email: "not-an-email" },
      { password: "Sh0rt!" },
      { password: "nouppercase1!" },
      { password: "NoDigitsHere!" },
      { password: "NoSpecial123" },
    ];
    for (const override of bad) {
      assert.equal(signupSchema.safeParse({ ...base, ...override }).success, false, JSON.stringify(override));
    }
  });
});
