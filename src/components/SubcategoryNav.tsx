import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const subcategories = [
  { name: "Всички", path: "" },
  { name: "Пръстени", path: "/rings" },
  { name: "Обеци", path: "/earrings" },
  { name: "Колиета", path: "/necklaces" },
  { name: "Гривни", path: "/bracelets" },
];

interface SubcategoryNavProps {
  basePath: string;
}

export function SubcategoryNav({ basePath }: SubcategoryNavProps) {
  const location = useLocation();

  return (
    <nav className="flex flex-wrap gap-2 justify-center mb-8">
      {subcategories.map((sub) => {
        const fullPath = basePath + sub.path;
        const isActive = location.pathname === fullPath;
        
        return (
          <Link
            key={sub.name}
            to={fullPath}
            className={cn(
              "px-4 py-2 text-sm font-body rounded-sm border transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {sub.name}
          </Link>
        );
      })}
    </nav>
  );
}
