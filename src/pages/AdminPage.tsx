import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Plus, Upload, X, Edit2, ArrowLeft, Loader2, LogOut, Package, ShoppingBag, Eye, MessageSquare, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { formatDualCurrency } from '@/lib/currency';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const categories = [
  { value: 'handmade', label: 'Ръчно изработени бижута' },
  { value: 'stainless-steel', label: 'Неръждаема стомана' },
  { value: 'silver', label: 'Сребро' },
  { value: 'moissanite', label: 'Мойсанит' },
];

const subcategories = [
  { value: 'rings', label: 'Пръстени' },
  { value: 'earrings', label: 'Обеци' },
  { value: 'necklaces', label: 'Колиета' },
  { value: 'bracelets', label: 'Гривни' },
];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  subcategory: string | null;
  images: string[];
  stock: number;
  specifications: unknown;
  is_active: boolean | null;
}

interface Order {
  id: string;
  status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    city?: string;
    address?: string;
    postalCode?: string;
  };
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedOrderItems, setExpandedOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [stock, setStock] = useState('0');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Predefined size options based on subcategory
  const getSizeOptions = (sub: string) => {
    switch (sub) {
      case 'rings':
        return ['5', '6', '7', '8', '9', '10'];
      case 'necklaces':
        return ['35', '36', '36.5', '37', '38', '39', '40', '41', '42'];
      case 'bracelets':
        return ['14', '15', '15.5', '16', '16.5', '17', '18', '19', '20', '21'];
      case 'earrings':
        return ['S', 'M'];
      default:
        return [];
    }
  };
  
  // Color/Finish options (for all jewelry)
  const colorOptions = [
    { value: 'silver', label: 'Сребристо' },
    { value: 'gold', label: 'Златисто' },
  ];

  // Product variants state
  const [productVariants, setProductVariants] = useState<Array<{ size: string; color: string; stock: number }>>([]);

  // Check authentication and admin role
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check admin role using the has_role function via RPC or direct query
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        if (import.meta.env.DEV) {
          console.error('Error checking admin role:', roleError);
        }
        toast.error('Грешка при проверка на правата за достъп');
        navigate('/');
        return;
      }

      if (!roleData) {
        toast.error('Нямате администраторски права за достъп');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      setAuthLoading(false);
    };

    checkAdminAccess();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchMessages();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Излязохте успешно');
    navigate('/');
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Грешка при зареждане на продуктите');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Грешка при зареждане на поръчките');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      // Deduplicate orders by session_id - keep the latest one per session
      const allOrders = (data || []) as Order[];
      const seen = new Map<string, Order>();
      const deduped: Order[] = [];
      for (const order of allOrders) {
        const key = (order as any).session_id;
        if (key && seen.has(key)) continue;
        if (key) seen.set(key, order);
        deduped.push(order);
      }
      
      // For orders with total=0, compute total from order_items
      const zeroTotalIds = deduped.filter(o => o.total === 0).map(o => o.id);
      if (zeroTotalIds.length > 0) {
        const { data: items } = await supabase
          .from('order_items')
          .select('order_id, product_price, quantity')
          .in('order_id', zeroTotalIds);
        
        if (items) {
          const totalsMap = new Map<string, number>();
          for (const item of items) {
            const current = totalsMap.get(item.order_id) || 0;
            totalsMap.set(item.order_id, current + item.product_price * item.quantity);
          }
          for (const order of deduped) {
            if (order.total === 0 && totalsMap.has(order.id)) {
              order.subtotal = totalsMap.get(order.id)!;
              order.total = order.subtotal + order.shipping_cost;
            }
          }
        }
      }
      
      setOrders(deduped);
    }
    setOrdersLoading(false);
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Грешка при зареждане на съобщенията');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      setMessages((data || []) as ContactMessage[]);
    }
    setMessagesLoading(false);
  };

  const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      toast.error('Грешка при маркиране като прочетено');
    } else {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това съобщение?')) return;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast.error('Грешка при изтриване на съобщението');
    } else {
      toast.success('Съобщението е изтрито');
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      return [];
    }
    return data as OrderItem[];
  };

  const toggleOrderExpand = async (order: Order) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      setExpandedOrderItems([]);
      return;
    }
    setExpandedOrderId(order.id);
    const items = await fetchOrderItems(order.id);
    setExpandedOrderItems(items);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Грешка при обновяване на статуса');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      toast.success('Статусът е обновен');
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази поръчка?')) return;

    await supabase.from('order_items').delete().eq('order_id', orderId);
    
    const { error } = await supabase.from('orders').delete().eq('id', orderId);

    if (error) {
      toast.error('Грешка при изтриване на поръчката');
      if (import.meta.env.DEV) console.error(error);
    } else {
      toast.success('Поръчката е изтрита');
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
        setExpandedOrderItems([]);
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'outline';
      case 'pending':
      default:
        return 'destructive';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Изчаква';
      case 'paid':
        return 'Платена';
      case 'shipped':
        return 'Изпратена';
      case 'delivered':
        return 'Доставена';
      case 'cancelled':
        return 'Отказана';
      default:
        return status;
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory('');
    setSubcategory('');
    setStock('0');
    setImages([]);
    setSpecifications([]);
    setSelectedSizes([]);
    setSelectedTypes([]);
    setProductVariants([]);
    setEditingProduct(null);
  };

  const openNewProductForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = async (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setOriginalPrice(product.original_price?.toString() || '');
    setCategory(product.category);
    setSubcategory(product.subcategory || '');
    setStock(product.stock.toString());
    setImages(product.images || []);
    const specs = product.specifications as Record<string, unknown> | null;
    setSpecifications(
      Object.entries(specs || {})
        .filter(([key]) => key !== 'available_sizes' && key !== 'available_types')
        .map(([key, value]) => ({ key, value: String(value) }))
    );
    
    // Load existing variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('size, color, stock')
      .eq('product_id', product.id);
    
    const loadedVariants = variants || [];
    setProductVariants(loadedVariants);
    
    // Derive selectedSizes and selectedTypes from actual variants
    const sizesFromVariants = [...new Set(loadedVariants.map(v => v.size))].filter(s => s !== 'one-size');
    const typesFromVariants = [...new Set(loadedVariants.map(v => v.color))];
    setSelectedSizes(sizesFromVariants);
    setSelectedTypes(typesFromVariants);
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Невалиден тип файл: ${file.name}. Позволени са само JPEG, PNG и WebP.`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Файлът е твърде голям: ${file.name}. Максимум 5MB.`);
        continue;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Грешка при качване на ${file.name}`);
        if (import.meta.env.DEV) {
          console.error(uploadError);
        }
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      newImages.push(urlData.publicUrl);
    }

    setImages([...images, ...newImages]);
    setUploading(false);
    if (newImages.length > 0) {
      toast.success('Снимките са качени успешно');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      toast.error('Моля попълнете задължителните полета');
      return;
    }

    const specsObject = specifications.reduce((acc, { key, value }) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string | string[]>);

    // Add available sizes and types to specs for display purposes
    if (selectedSizes.length > 0) {
      specsObject.available_sizes = selectedSizes;
    }
    if (selectedTypes.length > 0) {
      specsObject.available_types = selectedTypes;
    }

    // Build complete variants list from selections
    const hasSizeVariants = subcategory === 'rings' || subcategory === 'bracelets' || subcategory === 'necklaces' || subcategory === 'earrings';
    const effectiveSizes = hasSizeVariants ? selectedSizes : (selectedTypes.length > 0 ? ['one-size'] : []);
    
    const allVariants: Array<{ size: string; color: string; stock: number }> = [];
    for (const size of effectiveSizes) {
      for (const color of selectedTypes) {
        const existing = productVariants.find(v => v.size === size && v.color === color);
        allVariants.push({ size, color, stock: existing?.stock ?? 0 });
      }
    }
    
    // Calculate total stock from variants
    const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);

    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category,
      subcategory: subcategory || null,
      stock: totalStock || parseInt(stock) || 0,
      images,
      specifications: specsObject,
      is_active: true,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('Грешка при обновяване на продукта');
        if (import.meta.env.DEV) {
          console.error(error);
        }
      } else {
        // Update variants
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProduct.id);
        
        if (allVariants.length > 0) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(allVariants.map(v => ({
              product_id: editingProduct.id,
              size: v.size,
              color: v.color,
              stock: v.stock
            })));
          
          if (variantError && import.meta.env.DEV) {
            console.error('Variant error:', variantError);
          }
        }
        
        toast.success('Продуктът е обновен успешно');
        resetForm();
        setIsFormOpen(false);
        fetchProducts();
      }
    } else {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();

      if (error) {
        toast.error('Грешка при добавяне на продукта');
        if (import.meta.env.DEV) {
          console.error(error);
        }
      } else {
        // Insert variants for the new product
        if (allVariants.length > 0 && newProduct) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(allVariants.map(v => ({
              product_id: newProduct.id,
              size: v.size,
              color: v.color,
              stock: v.stock
            })));
          
          if (variantError && import.meta.env.DEV) {
            console.error('Variant error:', variantError);
          }
        }
        
        toast.success('Продуктът е добавен успешно');
        resetForm();
        setIsFormOpen(false);
        fetchProducts();
      }
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този продукт?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast.error('Грешка при изтриване на продукта');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      toast.success('Продуктът е изтрит успешно');
      fetchProducts();
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка на правата за достъп...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading text-foreground">Админ панел</h1>
              {user && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'products' && !isFormOpen && (
              <Button onClick={openNewProductForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Добави продукт
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Изход
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Продукти
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Поръчки
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 relative">
              <MessageSquare className="h-4 w-4" />
              Съобщения
              {messages.filter(m => !m.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {messages.filter(m => !m.is_read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">

        {isFormOpen ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingProduct ? 'Редактиране на продукт' : 'Нов продукт'}
                <Button variant="ghost" size="icon" onClick={() => { resetForm(); setIsFormOpen(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Име на продукта *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Златен пръстен с диамант"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Цена (лв.) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="99.99"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Стара цена (лв.)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="129.99"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Изберете категория" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Подкатегория</Label>
                    <Select value={subcategory} onValueChange={setSubcategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Изберете подкатегория" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variant Management - For all products */}
                  {subcategory && (
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Варианти {(subcategory === 'rings' || subcategory === 'bracelets' || subcategory === 'necklaces') ? '(Размер + Цвят = Наличност)' : '(Цвят = Наличност)'}</Label>
                      </div>
                      
                      {/* Size selection - only for rings, bracelets, necklaces */}
                      {(subcategory === 'rings' || subcategory === 'bracelets' || subcategory === 'necklaces' || subcategory === 'earrings') && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            {subcategory === 'rings' ? 'Размери (5-10)' : subcategory === 'necklaces' ? 'Дължина (35-42 см)' : subcategory === 'earrings' ? 'Размер (S, M)' : 'Размери (14-21 см)'}
                          </Label>
                          <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md bg-background">
                            {getSizeOptions(subcategory).map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  setSelectedSizes(prev => 
                                    prev.includes(size) 
                                      ? prev.filter(s => s !== size)
                                      : [...prev, size]
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                  selectedSizes.includes(size)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                              >
                                {subcategory === 'rings' ? `Размер ${size}` : subcategory === 'earrings' ? size : `${size} см`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Color selection - for ALL subcategories */}
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Цвят / Покритие</Label>
                        <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md bg-background">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => {
                                setSelectedTypes(prev => 
                                  prev.includes(color.value) 
                                    ? prev.filter(t => t !== color.value)
                                    : [...prev, color.value]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                selectedTypes.includes(color.value)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              }`}
                            >
                              {color.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Variant stock grid - with sizes */}
                      {(subcategory === 'rings' || subcategory === 'bracelets' || subcategory === 'necklaces') && selectedSizes.length > 0 && selectedTypes.length > 0 && (
                        <div className="space-y-3 border border-input rounded-md p-4 bg-muted/30">
                          <Label className="text-sm font-medium">Наличност по варианти</Label>
                          <div className="grid gap-3">
                            {selectedSizes.sort((a, b) => Number(a) - Number(b)).map((size) => (
                              <div key={size} className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                  {subcategory === 'rings' ? `Размер ${size}` : `${size} см`}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  {selectedTypes.map((color) => {
                                    const variant = productVariants.find(v => v.size === size && v.color === color);
                                    const colorLabel = colorOptions.find(c => c.value === color)?.label || color;
                                    return (
                                      <div key={`${size}-${color}`} className="flex items-center gap-2">
                                        <span className="text-sm min-w-[80px]">{colorLabel}:</span>
                                        <Input
                                          type="number"
                                          min="0"
                                          value={variant?.stock ?? 0}
                                          onChange={(e) => {
                                            const newStock = parseInt(e.target.value) || 0;
                                            setProductVariants(prev => {
                                              const existing = prev.find(v => v.size === size && v.color === color);
                                              if (existing) {
                                                return prev.map(v => 
                                                  v.size === size && v.color === color 
                                                    ? { ...v, stock: newStock }
                                                    : v
                                                );
                                              } else {
                                                return [...prev, { size, color, stock: newStock }];
                                              }
                                            });
                                          }}
                                          className="w-20 h-8"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Обща наличност: {productVariants.reduce((sum, v) => sum + v.stock, 0)} бр.
                          </p>
                        </div>
                      )}

                      {/* Variant stock grid - without sizes (earrings, etc.) */}
                      {!(subcategory === 'rings' || subcategory === 'bracelets' || subcategory === 'necklaces') && selectedTypes.length > 0 && (
                        <div className="space-y-3 border border-input rounded-md p-4 bg-muted/30">
                          <Label className="text-sm font-medium">Наличност по цвят</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedTypes.map((color) => {
                              const variant = productVariants.find(v => v.size === 'one-size' && v.color === color);
                              const colorLabel = colorOptions.find(c => c.value === color)?.label || color;
                              return (
                                <div key={color} className="flex items-center gap-2">
                                  <span className="text-sm min-w-[80px]">{colorLabel}:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={variant?.stock ?? 0}
                                    onChange={(e) => {
                                      const newStock = parseInt(e.target.value) || 0;
                                      setProductVariants(prev => {
                                        const existing = prev.find(v => v.size === 'one-size' && v.color === color);
                                        if (existing) {
                                          return prev.map(v => 
                                            v.size === 'one-size' && v.color === color 
                                              ? { ...v, stock: newStock }
                                              : v
                                          );
                                        } else {
                                          return [...prev, { size: 'one-size', color, stock: newStock }];
                                        }
                                      });
                                    }}
                                    className="w-20 h-8"
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Обща наличност: {productVariants.filter(v => selectedTypes.includes(v.color)).reduce((sum, v) => sum + v.stock, 0)} бр.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Simple stock only when no subcategory is selected */}
                  {!subcategory && (
                    <div className="space-y-2">
                      <Label htmlFor="stock">Наличност</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Описание на продукта..."
                    rows={4}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <Label>Снимки</Label>
                  <div className="flex flex-wrap gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      )}
                    </label>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Характеристики</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                      <Plus className="h-4 w-4 mr-1" />
                      Добави
                    </Button>
                  </div>
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <Input
                        placeholder="Ключ (напр. Материал)"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Стойност (напр. Злато 14К)"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpecification(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Запази промените' : 'Добави продукт'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { resetForm(); setIsFormOpen(false); }}
                  >
                    Отказ
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Продукти ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Зареждане...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Няма добавени продукти
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-border rounded-lg p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
                          Няма снимка
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {categories.find(c => c.value === product.category)?.label}
                      </p>
                      <p className="text-primary font-semibold">{product.price.toFixed(2)} лв.</p>
                      
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Поръчки ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Зареждане...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Няма поръчки
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div
                          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => toggleOrderExpand(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm text-muted-foreground">
                                  #{order.id.slice(0, 8)}
                                </span>
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-semibold">{formatDualCurrency(order.total)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('bg-BG', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {expandedOrderId === order.id && (
                          <div className="border-t border-border p-4 bg-muted/30 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h3 className="font-medium">Информация за клиента</h3>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-muted-foreground">Име:</span> {order.customer_name}</p>
                                  <p><span className="text-muted-foreground">Имейл:</span> {order.customer_email}</p>
                                  <p><span className="text-muted-foreground">Телефон:</span> {order.customer_phone}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h3 className="font-medium">Адрес за доставка (Speedy)</h3>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-muted-foreground">Град:</span> {order.shipping_address?.city}</p>
                                  <p><span className="text-muted-foreground">Адрес:</span> {order.shipping_address?.address}</p>
                                  <p><span className="text-muted-foreground">Пощенски код:</span> {order.shipping_address?.postalCode}</p>
                                </div>
                              </div>
                            </div>

                            {order.notes && (
                              <div className="space-y-2">
                                <h3 className="font-medium">Бележки</h3>
                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                              </div>
                            )}

                            <div className="space-y-4">
                              <h3 className="font-medium">Продукти</h3>
                              <div className="space-y-2">
                                {expandedOrderItems.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                                    <div>
                                      <p className="font-medium">{item.product_name}</p>
                                      <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                    <p className="font-medium">{formatDualCurrency(item.product_price * item.quantity)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Междинна сума</span>
                                <span>{formatDualCurrency(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Доставка (Speedy)</span>
                                <span>{order.shipping_cost === 0 ? 'Безплатна' : formatDualCurrency(order.shipping_cost)}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Общо</span>
                                <span>{formatDualCurrency(order.total)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t">
                              <Label>Статус:</Label>
                              <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                                <SelectTrigger className="w-48" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Изчаква</SelectItem>
                                  <SelectItem value="paid">Платена</SelectItem>
                                  <SelectItem value="shipped">Изпратена</SelectItem>
                                  <SelectItem value="delivered">Доставена</SelectItem>
                                  <SelectItem value="cancelled">Отказана</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }} className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Изтрий
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Съобщение от {selectedMessage.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Информация за контакт</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Име:</span> {selectedMessage.name}</p>
                        <p><span className="text-muted-foreground">Имейл:</span> {selectedMessage.email}</p>
                        {selectedMessage.phone && (
                          <p><span className="text-muted-foreground">Телефон:</span> {selectedMessage.phone}</p>
                        )}
                        <p><span className="text-muted-foreground">Дата:</span> {new Date(selectedMessage.created_at).toLocaleDateString('bg-BG', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Съобщение</h3>
                    <p className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{selectedMessage.message}</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    {!selectedMessage.is_read && (
                      <Button variant="outline" onClick={() => markMessageAsRead(selectedMessage.id)} className="gap-2">
                        <Check className="h-4 w-4" />
                        Маркирай като прочетено
                      </Button>
                    )}
                    <a href={`mailto:${selectedMessage.email}`}>
                      <Button variant="default" className="gap-2">
                        Отговори по имейл
                      </Button>
                    </a>
                    <Button variant="destructive" onClick={() => deleteMessage(selectedMessage.id)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Изтрий
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Съобщения ({messages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {messagesLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Зареждане...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Няма съобщения
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!msg.is_read ? 'bg-primary/5 border-primary/30' : ''}`}
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (!msg.is_read) {
                              markMessageAsRead(msg.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{msg.name}</span>
                                {!msg.is_read && (
                                  <Badge variant="default" className="text-xs">Ново</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{msg.email}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-md">{msg.message}</p>
                            </div>
                            <div className="text-right space-y-1 ml-4">
                              <p className="text-sm text-muted-foreground">
                                {new Date(msg.created_at).toLocaleDateString('bg-BG', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                Виж
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
