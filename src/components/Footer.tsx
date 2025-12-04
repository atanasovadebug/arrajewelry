import { Instagram, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Ръчна изработка", href: "/category/handmade" },
  { name: "Неръждаема стомана", href: "/category/stainless-steel" },
  { name: "Сребро", href: "/category/silver" },
  { name: "Моасанит", href: "/category/moissanite" },
];

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">Arra Jewelry</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Ръчно изработени с любов в България. Всяко бижу разказва история за елегантност и вечна красота.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/arra_jewelry_vt"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Колекции</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Контакт</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>България</span>
              </li>
              <li>
                <a
                  href="https://instagram.com/arra_jewelry_vt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  <span>@arra_jewelry_vt</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Arra Jewelry. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}
