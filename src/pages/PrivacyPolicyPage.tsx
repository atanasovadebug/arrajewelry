import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold">Политика за поверителност</h1>
          <p className="mt-2 text-muted-foreground">Privacy Policy</p>
        </header>

        <section className="mt-8 max-w-3xl space-y-8">
          <div>
            <h2 className="font-heading text-xl font-semibold">1. Събиране на лични данни</h2>
            <p className="mt-2 text-muted-foreground">
              ARRA Jewelry събира и обработва лични данни единствено с цел:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>обработка и доставка на поръчки;</li>
              <li>комуникация с клиенти;</li>
              <li>изпълнение на законови задължения.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Събираните данни могат да включват:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>име и фамилия;</li>
              <li>адрес за доставка;</li>
              <li>имейл;</li>
              <li>телефонен номер.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">2. Защита на данните</h2>
            <p className="mt-2 text-muted-foreground">
              Личните данни се обработват съгласно Регламент (ЕС) 2016/679 (GDPR).
            </p>
            <p className="mt-2 text-muted-foreground">
              ARRA Jewelry предприема всички разумни технически и организационни мерки за защита на информацията.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">3. Споделяне на данни</h2>
            <p className="mt-2 text-muted-foreground">
              Личните данни не се продават и не се предоставят на трети лица, освен когато това е необходимо за:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>доставка (куриерски фирми);</li>
              <li>плащане (платежни оператори);</li>
              <li>законови изисквания.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">4. Права на потребителя</h2>
            <p className="mt-2 text-muted-foreground">
              Всеки клиент има право да:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>получи информация за съхраняваните му данни;</li>
              <li>поиска корекция или изтриване;</li>
              <li>оттегли съгласието си за обработка.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Запитвания могат да бъдат отправяни чрез{" "}
              <Link to="/contact" className="underline underline-offset-2 hover:text-foreground">
                контактната форма
              </Link>{" "}
              на сайта.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">5. Бисквитки (Cookies)</h2>
            <p className="mt-2 text-muted-foreground">
              Сайтът използва бисквитки с цел подобряване на потребителското изживяване и анализ на трафика. Клиентът може да управлява настройките на бисквитките чрез браузъра си.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">6. Промени в политиката</h2>
            <p className="mt-2 text-muted-foreground">
              ARRA Jewelry си запазва правото да актуализира настоящата Политика за поверителност, като всички промени ще бъдат публикувани на сайта.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
