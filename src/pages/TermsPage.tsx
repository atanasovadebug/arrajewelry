import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold">Общи условия</h1>
          <p className="mt-2 text-muted-foreground">Terms & Conditions</p>
        </header>

        <section className="mt-8 max-w-3xl space-y-8">
          <div>
            <h2 className="font-heading text-xl font-semibold">1. Общи положения</h2>
            <p className="mt-2 text-muted-foreground">
              Настоящите Общи условия уреждат отношенията между ARRA Jewelry (наричан по-долу „Търговецът") и потребителите на онлайн магазина.
            </p>
            <p className="mt-2 text-muted-foreground">
              С достъпа до сайта и/или извършването на поръчка, клиентът декларира, че е запознат с настоящите Общи условия и ги приема безусловно.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">2. Продукти</h2>
            <p className="mt-2 text-muted-foreground">
              ARRA Jewelry предлага бижута, включително гривни, пръстени и колиета, като за част от продуктите клиентът има възможност да избере:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>размер;</li>
              <li>цвят/покритие (златисто или сребристо).</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Изборът на размер и/или цвят представлява индивидуална поръчка, изработена или подготвена специално за клиента.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">3. Поръчки</h2>
            <p className="mt-2 text-muted-foreground">
              Поръчка се счита за приета след успешно завършване на процеса на плащане.
            </p>
            <p className="mt-2 text-muted-foreground">
              Търговецът си запазва правото да откаже поръчка при:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>изчерпана наличност;</li>
              <li>техническа грешка;</li>
              <li>некоректни данни, предоставени от клиента.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">4. Цени и плащане</h2>
            <p className="mt-2 text-muted-foreground">
              Всички цени са в евро (Euro) и български лева (BGN) и са крайни, освен ако не е посочено друго.
            </p>
            <p className="mt-2 text-muted-foreground">
              Плащането се извършва онлайн чрез наличните методи за картово плащане.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">5. Доставка</h2>
            <p className="mt-2 text-muted-foreground">
              Доставката се извършва чрез куриерска фирма до адрес, офис и автомат, посочен от клиента.
            </p>
            <p className="mt-2 text-muted-foreground">
              Срокът за обработка и изпращане на поръчките е от 1-2 работни дни, ако продуктът е наличен и освен ако не е упоменато друго.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">6. Връщане и отказ</h2>
            <p className="mt-2 text-muted-foreground">
              Съгласно законодателството, клиентът има право на отказ в срок от 14 дни, освен в следните случаи:
            </p>
            <p className="mt-3 text-muted-foreground font-medium">
              Правото на отказ НЕ се прилага за:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>бижута, изработени или подготвени по индивидуално избран размер и/или цвят;</li>
              <li>продукти, които са били носени, разпечатани или използвани.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              С извършване на поръчка клиентът потвърждава, че е запознат с тези условия.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">7. Отговорност</h2>
            <p className="mt-2 text-muted-foreground">
              ARRA Jewelry не носи отговорност за:
            </p>
            <ul className="mt-2 text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>разлики в цветовете, дължащи се на настройките на екрана;</li>
              <li>забавяния, причинени от куриерската фирма;</li>
              <li>неправилна употреба или съхранение на продукта.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold">8. Промени</h2>
            <p className="mt-2 text-muted-foreground">
              Търговецът си запазва правото да променя настоящите Общи условия по всяко време, като актуалната версия винаги ще бъде публикувана на сайта.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-muted-foreground">
              За въпроси относно общите условия, можете да използвате{" "}
              <Link to="/contact" className="underline underline-offset-2 hover:text-foreground">
                контактната форма
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
