import { Layout } from "@/components/Layout";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold">Политика за поверителност</h1>
          <p className="mt-2 text-muted-foreground">
            Този текст е базов шаблон. Препоръчително е да бъде прегледан и адаптиран спрямо GDPR изискванията.
          </p>
        </header>

        <section className="mt-8 max-w-3xl space-y-6">
          <div>
            <h2 className="font-heading text-xl font-semibold">Какви данни събираме</h2>
            <p className="mt-2 text-muted-foreground">
              При поръчка събираме данни за контакт и доставка (име, имейл, телефон, адрес), необходими за изпълнение на
              поръчката.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Цел на обработката</h2>
            <p className="mt-2 text-muted-foreground">
              Използваме данните единствено за обработка на поръчки, доставка, комуникация с клиента и счетоводни цели.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Съхранение и защита</h2>
            <p className="mt-2 text-muted-foreground">
              Данните се съхраняват в защитена среда и достъпът е ограничен до администратори.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Вашите права</h2>
            <p className="mt-2 text-muted-foreground">
              Имате право на достъп, корекция и изтриване на личните си данни, както и възражение срещу обработката.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
