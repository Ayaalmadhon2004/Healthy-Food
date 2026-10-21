import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getDictionaryServer } from "@/lib/i18n";
import { canManageTickets, TICKET_STATUSES } from "@/lib/validations/support";
import { updateTicketStatusAction } from "@/app/actions/supportActions";
import SupportTicketForm from "@/components/SupportTicketForm";

export const metadata = { title: "Support" };
const MAX_TICKETS = 200;
const DATE_LENGTH = 16;

export const dynamic = "force-dynamic";

interface SupportDict {
  title: string;
  subtitle: string;
  subject_label: string;
  message_label: string;
  submit: string;
  submitting: string;
  my_tickets: string;
  all_tickets: string;
  empty: string;
  sent: string;
  login_required: string;
  from: string;
  status: Record<string, string>;
  errors: Record<string, string>;
}

export default async function SupportPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "ar";
  const dict = (await getDictionaryServer(lang)) as { support: SupportDict };
  const t = dict.support;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6 text-center" dir={dir}>
        <div className="surface p-8 max-w-sm">
          <p className="text-xl font-medium mb-5 text-ink">{t.login_required}</p>
          <Link href="/login" className="btn btn-primary">{lang === "ar" ? "تسجيل الدخول" : "Sign in"}</Link>
        </div>
      </main>
    );
  }

  const isAdmin = canManageTickets(sessionUser.role);
  const tickets = await prisma.supportTicket.findMany({
    where: isAdmin ? {} : { userId: sessionUser.id },
    orderBy: { createdAt: "desc" },
    take: MAX_TICKETS,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <main className="px-5 md:px-8 pt-10 md:pt-16 pb-20" dir={dir}>
      <div className="max-w-2xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
          <p className="text-ink-soft text-lg mt-3 leading-relaxed">{t.subtitle}</p>
        </header>

        <SupportTicketForm
          labels={{
            subject: t.subject_label,
            message: t.message_label,
            submit: t.submit,
            submitting: t.submitting,
            sent: t.sent,
            errors: t.errors,
          }}
        />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink pb-2 border-b border-line-strong">{isAdmin ? t.all_tickets : t.my_tickets}</h2>
          {tickets.length === 0 && <p className="text-ink-mute">{t.empty}</p>}
          {tickets.map((ticket) => (
            <article key={ticket.id} className="surface p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink break-words">{ticket.subject}</h3>
                <span className="text-sm font-medium text-olive-800 whitespace-nowrap flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                  {t.status[ticket.status] ?? ticket.status}
                </span>
              </div>
              {isAdmin && (
                <p className="text-sm text-ink-mute">{t.from}: {ticket.user.name} ({ticket.user.email})</p>
              )}
              <p className="text-ink-soft whitespace-pre-wrap break-words">{ticket.message}</p>
              <p className="text-sm text-ink-mute">{ticket.createdAt.toISOString().slice(0, DATE_LENGTH).replace("T", " ")} UTC</p>
              {isAdmin && (
                <form action={updateTicketStatusAction} className="flex flex-wrap gap-2 pt-1">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  {TICKET_STATUSES.filter((s) => s !== ticket.status).map((s) => (
                    <button key={s} type="submit" name="status" value={s} className="text-sm font-medium px-3 py-1 rounded-md border border-line-strong hover:bg-paper-deep">
                      {t.status[s]}
                    </button>
                  ))}
                </form>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
