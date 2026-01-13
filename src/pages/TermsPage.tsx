import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold">Общи условия</h1>
          <p className="mt-2 text-muted-foreground">
            Този текст е базов шаблон. Препоръчително е да бъде прегледан от юрист спрямо вашия бизнес.
          </p>
        </header>

        <section className="mt-8 max-w-3xl space-y-6">
          <div>
            <h2 className="font-heading text-xl font-semibold">1. Поръчки</h2>
            <p className="mt-2 text-muted-foreground">
              Поръчка се счита за приета след успешно плащане и потвърждение.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">2. Цени и плащане</h2>
            <p className="mt-2 text-muted-foreground">
              Плащането се извършва онлайн с карта чрез защитена платежна страница.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">3. Доставка</h2>
            <p className="mt-2 text-muted-foreground">
              Условията за доставка са описани в страницата{" "}
              <Link to="/shipping-returns" className="underline underline-offset-2 hover:text-foreground">
                „Доставка и връщане“
              </Link>
              .
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">4. Контакт</h2>
            <p className="mt-2 text-muted-foreground">
              Можете да ни пишете през формата в{" "}
              <Link to="/contact" className="underline underline-offset-2 hover:text-foreground">
                „Контакти“
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
