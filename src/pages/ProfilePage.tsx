import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDualCurrency } from "@/lib/currency";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Settings, Loader2, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch favorite products
  const { data: favoriteProducts = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ["favorite-products", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", favorites);
      if (error) throw error;
      return data;
    },
    enabled: favorites.length > 0,
  });

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Паролата трябва да е поне 6 символа");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Паролите не съвпадат");
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      toast.error("Грешка при промяна на паролата: " + error.message);
    } else {
      toast.success("Паролата е променена успешно!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-semibold">Моят профил</h1>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Изход
          </Button>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              Любими продукти
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Настройки на акаунта
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {loadingFavorites ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : favoriteProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground text-lg">Нямате любими продукти все още.</p>
                <Link to="/">
                  <Button variant="outline" className="mt-4">Разгледайте продуктите</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative"
                  >
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="aspect-square overflow-hidden rounded-sm bg-secondary/30 mb-3">
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm">
                        {formatDualCurrency(Number(product.price))}
                      </p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => toggleFavorite.mutate(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle>Имейл</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{user.email}</p>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Промяна на парола</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Нова парола</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Потвърдете паролата</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={updatingPassword}>
                      {updatingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Промяна...
                        </>
                      ) : (
                        "Промени паролата"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
