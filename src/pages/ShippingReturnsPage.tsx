import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

export default function ShippingReturnsPage() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold">Доставка и връщане</h1>
        </header>

        <section className="mt-8 max-w-3xl space-y-8">
          {/* Доставка */}
          <div>
            <h2 className="font-heading text-xl font-semibold">Доставка</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                Всички поръчки се обработват и изпращат в срок от 1-2 работни дни, ако са налични и освен ако изрично не е посочено друго.
              </p>
              <p>
                Доставката се извършва чрез куриерска фирма, като разходите за доставка са за сметка на клиента и се посочват ясно преди финализиране на поръчката.
              </p>
              <p className="font-medium text-foreground">
                ARRA Jewelry не носи отговорност за забавяния, причинени от куриерската фирма.
              </p>
            </div>
          </div>

          {/* Право на отказ и връщане */}
          <div>
            <h2 className="font-heading text-xl font-semibold">Право на отказ и връщане</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                Съгласно действащото законодателство, при онлайн покупки клиентът има право да се откаже от договора в срок от 14 дни, считано от датата на получаване на продукта, без да посочва причина, освен в случаите, описани по-долу.
              </p>
            </div>
          </div>

          {/* Изключения от правото на отказ */}
          <div>
            <h2 className="font-heading text-xl font-semibold">Изключения от правото на отказ</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>Правото на отказ <strong className="text-foreground">НЕ</strong> се прилага за:</p>
              <p>
                Бижута, изработени или подготвени по индивидуален избор на клиента, включително, но не само:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>избран размер (гривни, пръстени, колиета);</li>
                <li>избран цвят/покритие (златисто или сребристо);</li>
              </ul>
              <p>
                Продукти, които поради хигиенни съображения не подлежат на връщане, ако са били разпечатани или носени.
              </p>
              <p className="font-medium text-foreground">
                С извършването на поръчка клиентът потвърждава, че е запознат и съгласен с това, че изборът на размер и/или цвят представлява индивидуална поръчка, за която не се прилага правото на отказ.
              </p>
            </div>
          </div>

          {/* Условия за приемане на връщане */}
          <div>
            <h2 className="font-heading text-xl font-semibold">Условия за приемане на връщане (когато е приложимо)</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>В случаите, в които връщането е допустимо:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>продуктът <strong className="text-foreground">НЕ</strong> трябва да бъде носен, да бъде в оригинално състояние и опаковка;</li>
                <li>разходите по връщането са за сметка на клиента, освен ако не е договорено друго;</li>
                <li>възстановяването на сумата се извършва в срок до 14 дни след получаване на върнатия продукт.</li>
              </ul>
              <p className="font-medium text-foreground">
                ARRA Jewelry си запазва правото да откаже връщане при установени следи от употреба или нарушена цялост на продукта.
              </p>
            </div>
          </div>

          {/* Контакт */}
          <div>
            <h2 className="font-heading text-xl font-semibold">Контакт</h2>
            <p className="mt-3 text-muted-foreground">
              За въпроси относно доставка и връщане, можете да използвате{" "}
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
