import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Името е задължително").max(100, "Името е прекалено дълго"),
  email: z.string().trim().email("Невалиден имейл адрес").max(255, "Имейлът е прекалено дълъг"),
  phone: z.string().trim().max(20, "Телефонът е прекалено дълъг").optional().or(z.literal("")),
  message: z.string().trim().min(1, "Съобщението е задължително").max(2000, "Съобщението е прекалено дълго"),
});

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate input
      const validated = contactSchema.parse(form);

      // Insert into database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          message: validated.message,
        });

      if (error) {
        throw new Error("Грешка при изпращане на съобщението");
      }

      toast.success("Съобщението е изпратено успешно! Ще се свържем с вас скоро.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Възникна грешка. Моля, опитайте отново.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold">Контакти</h1>
          <p className="mt-2 text-muted-foreground">
            Изпратете ни съобщение чрез формата по-долу. (Не показваме публично имейл адрес.)
          </p>
        </header>

        <section className="mt-8 max-w-2xl">
          <form onSubmit={onSubmit} className="bg-card border rounded-lg p-6 space-y-4">
            <div>
              <Label htmlFor="name">Име *</Label>
              <Input id="name" name="name" value={form.name} onChange={onChange} required className="mt-1" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Имейл *</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Телефон (по желание)</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Съобщение *</Label>
              <Textarea id="message" name="message" value={form.message} onChange={onChange} required className="mt-1" rows={6} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Изпращане..." : "Изпрати"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            За бърз контакт: пишете ни в Instagram (@arra_jewelry_vt).
          </p>
        </section>
      </main>
    </Layout>
  );
}
