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
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 text-center" dir={dir}>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-sm">
          <p className="text-xl font-bold mb-6 text-gray-800">{t.login_required}</p>
          <Link href="/login" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold inline-block">Login</Link>
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
    <main className="min-h-screen bg-[#F8FAFC] p-6" dir={dir}>
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-black text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
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
          <h2 className="text-xl font-bold text-gray-800">{isAdmin ? t.all_tickets : t.my_tickets}</h2>
          {tickets.length === 0 && <p className="text-gray-400">{t.empty}</p>}
          {tickets.map((ticket) => (
            <article key={ticket.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-gray-900 break-words">{ticket.subject}</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
                  {t.status[ticket.status] ?? ticket.status}
                </span>
              </div>
              {isAdmin && (
                <p className="text-xs text-gray-400">{t.from}: {ticket.user.name} ({ticket.user.email})</p>
              )}
              <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{ticket.message}</p>
              <p className="text-xs text-gray-400">{ticket.createdAt.toISOString().slice(0, DATE_LENGTH).replace("T", " ")} UTC</p>
              {isAdmin && (
                <form action={updateTicketStatusAction} className="flex flex-wrap gap-2 pt-1">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  {TICKET_STATUSES.filter((s) => s !== ticket.status).map((s) => (
                    <button key={s} type="submit" name="status" value={s} className="text-xs font-bold px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">
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
