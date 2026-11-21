import { adminRepo } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Business details" };

export default async function SettingsPage() {
  const settings = await adminRepo.getSettings();
  return (
    <div className="max-w-4xl">
      <h1 className="text-h1">Business details</h1>
      <p className="mb-8 mt-2 text-ink-2">
        These appear in the header, footer, contact page and Google search data. Leave a field empty rather than guessing; empty fields are hidden on the website.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
