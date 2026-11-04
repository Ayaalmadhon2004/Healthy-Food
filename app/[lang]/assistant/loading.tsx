import type { AssistantDict } from "@/components/assistant/types";
import { getDictionaryServer, getRequestLang } from "@/lib/i18n";

export default async function AssistantLoading() {
  const { assistant: t } = (await getDictionaryServer(await getRequestLang())) as { assistant: AssistantDict };
  return (
    <div role="status" aria-busy="true" className="min-h-[60vh] p-8 flex items-center justify-center">
      <span className="sr-only">{t.loading}</span>
      <div aria-hidden="true" className="w-full max-w-3xl space-y-6">
        <div className="h-12 rounded-md bg-stone-200 animate-pulse" />
        <div className="h-20 rounded-lg bg-white border border-line animate-pulse" />
        <div className="h-64 rounded-lg bg-white border border-line animate-pulse" />
      </div>
    </div>
  );
}
