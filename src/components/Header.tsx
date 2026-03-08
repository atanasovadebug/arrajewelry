import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Instagram, ChevronDown, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CartDrawer } from "./CartDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const categories = [
  {
    name: "Ръчна изработка",
    href: "/category/handmade",
    subcategories: [
      { name: "Пръстени", slug: "rings" },
      { name: "Обеци", slug: "earrings" },
      { name: "Колиета", slug: "necklaces" },
      { name: "Гривни", slug: "bracelets" },
    ],
  },
  {
    name: "Неръждаема стомана",
    href: "/category/stainless-steel",
    subcategories: [
      { name: "Пръстени", slug: "rings" },
      { name: "Обеци", slug: "earrings" },
      { name: "Колиета", slug: "necklaces" },
      { name: "Гривни", slug: "bracelets" },
    ],
  },
  {
    name: "Сребро",
    href: "/category/silver",
    subcategories: [
      { name: "Пръстени", slug: "rings" },
      { name: "Обеци", slug: "earrings" },
      { name: "Колиета", slug: "necklaces" },
      { name: "Гривни", slug: "bracelets" },
    ],
  },
  {
    name: "Мойсанит",
    href: "/category/moissanite",
    subcategories: [
      { name: "Пръстени", slug: "rings" },
      { name: "Обеци", slug: "earrings" },
      { name: "Колиета", slug: "necklaces" },
      { name: "Гривни", slug: "bracelets" },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Успешно излязохте от акаунта");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
              Arra Jewelry
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {categories.map((category) => (
              <DropdownMenu key={category.name}>
                <DropdownMenuTrigger className="flex items-center gap-1 bg-transparent font-body text-sm font-medium px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors outline-none">
                  {category.name}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] bg-popover">
                  {category.subcategories.map((sub) => (
                    <DropdownMenuItem key={sub.slug} asChild>
                      <Link
                        to={`${category.href}/${sub.slug}`}
                        className="w-full cursor-pointer"
                      >
                        {sub.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            <Link
              to="/contact"
              className="bg-transparent font-body text-sm font-medium px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Контакти
            </Link>
          </nav>

          {/* Cart, Social & Mobile Menu */}
          <div className="flex items-center gap-2">
            <CartDrawer />
            {user ? (
              <Link
                to="/profile"
                className="text-foreground/70 hover:text-primary transition-colors p-2"
                aria-label="Профил"
              >
                <LogIn className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="text-foreground/70 hover:text-primary transition-colors p-2"
                aria-label="Вход"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            <a
              href="https://instagram.com/arra_jewelry_vt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition-colors p-2"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4">
              <Link
                to="/contact"
                className="block py-3 font-body font-medium border-b border-border"
                onClick={() => setMobileMenuOpen(false)}
              >
                Контакти
              </Link>

              {categories.map((category) => (
                <div key={category.name} className="border-b border-border last:border-0">
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === category.name ? null : category.name
                      )
                    }
                    className="flex items-center justify-between w-full py-3 font-body font-medium"
                  >
                    {category.name}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        expandedCategory === category.name && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedCategory === category.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-3 pl-4 space-y-2">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              to={`${category.href}/${sub.slug}`}
                              className="block py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
