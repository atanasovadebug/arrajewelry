import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

export default function ShippingReturnsPage() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-10">
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold">Доставка и връщане</h1>
          <p className="mt-2 text-muted-foreground">
            Информация за методи на доставка, срокове и политика за връщане.
          </p>
        </header>

        <section className="mt-8 max-w-3xl space-y-6">
          <div>
            <h2 className="font-heading text-xl font-semibold">Доставка</h2>
            <p className="mt-2 text-muted-foreground">
              Доставката се извършва със Speedy (до адрес или до автомат). Очакван срок: 1–2 работни дни.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Цена на доставка</h2>
            <p className="mt-2 text-muted-foreground">
              Цената се изчислява при поръчка. Възможна е безплатна доставка при достигане на определена сума.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Връщане</h2>
            <p className="mt-2 text-muted-foreground">
              За информация относно връщане и рекламации, моля свържете се с нас през{" "}
              <Link to="/contact" className="underline underline-offset-2 hover:text-foreground">
                формата за контакт
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
