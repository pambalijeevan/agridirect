import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, Package, ShoppingCart, MessageSquare, Edit, Trash2, Check, X, Mail, Phone, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router';

export function FarmerDashboard() {
  const { user } = useAuth();
  const { products, orders, messages, notifications, users, addProduct, updateProduct, deleteProduct, updateOrderStatus } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    cropName: '',
    quantity: '',
    price: '',
    location: user?.location || '',
    description: '',
    unit: 'kg',
    images: [] as string[],
  });

  const myProducts = products.filter((product) => product.farmerId === user?.id);
  const myOrders = orders.filter((order) => myProducts.some((product) => product.id === order.productId));
  const unreadMessages = messages.filter((message) => message.receiverId === user?.id && !message.isRead).length;
  const unreadNotifications = notifications.filter((notification) => notification.userId === user?.id && !notification.read).length;

  const resetForm = () =>
    setProductForm({
      cropName: '',
      quantity: '',
      price: '',
      location: user?.location || '',
      description: '',
      unit: 'kg',
      images: [],
    });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const uploadedImages = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
            reader.readAsDataURL(file);
          })
      )
    );

    setProductForm((current) => ({
      ...current,
      images: [...current.images, ...uploadedImages.filter(Boolean)],
    }));
  };

  const removeImage = (index: number) => {
    setProductForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    if (productForm.images.length === 0) {
      toast.error('Please upload at least one product image.');
      return;
    }

    addProduct({
      farmerId: user.id,
      farmerName: user.name,
      cropName: productForm.cropName,
      quantity: Number(productForm.quantity),
      price: Number(productForm.price),
      location: productForm.location,
      description: productForm.description,
      unit: productForm.unit,
      image: productForm.images[0],
      images: productForm.images,
    });

    toast.success('Product added successfully. Buyers can now see it in their listings.');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateProduct = (productId: string) => {
    const product = myProducts.find((entry) => entry.id === productId);
    if (!product) {
      return;
    }

    updateProduct(productId, {
      cropName: productForm.cropName || product.cropName,
      quantity: Number(productForm.quantity) || product.quantity,
      price: Number(productForm.price) || product.price,
      location: productForm.location || product.location,
      description: productForm.description || product.description,
      unit: productForm.unit || product.unit,
      images: productForm.images.length > 0 ? productForm.images : product.images,
    });
    toast.success('Product updated successfully.');
    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    deleteProduct(productId);
    toast.success('Product deleted successfully.');
  };

  const startEdit = (product: (typeof myProducts)[number]) => {
    setEditingProduct(product.id);
    setProductForm({
      cropName: product.cropName,
      quantity: String(product.quantity),
      price: String(product.price),
      location: product.location,
      description: product.description,
      unit: product.unit,
      images: product.images,
    });
  };

  const handleOrderAction = (orderId: string, status: 'accepted' | 'rejected') => {
    updateOrderStatus(orderId, status);
    toast.success(`Order ${status} successfully.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {user?.name}. Only your own listed products appear here.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Products</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrders.filter((order) => order.status === 'pending').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <Link to="/messages" className="text-2xl font-bold text-green-600 hover:underline">
                {unreadMessages}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Products</CardTitle>
                <CardDescription>Manage listings that buyers and companies can see.</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>List a new crop for sale.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cropName">Crop Name</Label>
                        <Input id="cropName" value={productForm.cropName} onChange={(e) => setProductForm({ ...productForm, cropName: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={productForm.location} onChange={(e) => setProductForm({ ...productForm, location: e.target.value })} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per unit</Label>
                        <Input id="price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="images">Product Images</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          void handleImageUpload(e.target.files);
                          e.target.value = '';
                        }}
                      />
                      <p className="text-sm text-gray-500">Upload multiple images so companies can inspect the product clearly.</p>
                      {productForm.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {productForm.images.map((image, index) => (
                            <div key={`${index}-${image.slice(0, 20)}`} className="space-y-2">
                              <img src={image} alt={`Product preview ${index + 1}`} className="h-24 w-full rounded object-cover" />
                              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => removeImage(index)}>
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Product</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {myProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p>No products listed yet. Add your first product.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50">
                    <img src={product.image} alt={product.cropName} className="h-20 w-20 rounded object-cover" />
                    <div className="flex-1">
                      {editingProduct === product.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={productForm.cropName} onChange={(e) => setProductForm({ ...productForm, cropName: e.target.value })} />
                            <Input type="number" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
                            <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                            <Input value={productForm.location} onChange={(e) => setProductForm({ ...productForm, location: e.target.value })} />
                          </div>
                          <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} />
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              void handleImageUpload(e.target.files);
                              e.target.value = '';
                            }}
                          />
                          {productForm.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {productForm.images.map((image, index) => (
                                <div key={`${product.id}-${index}`} className="space-y-2">
                                  <img src={image} alt={`${product.cropName} ${index + 1}`} className="h-20 w-full rounded object-cover" />
                                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => removeImage(index)}>
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold">{product.cropName}</h3>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <div className="mt-1 flex gap-4 text-sm">
                            <span className="text-gray-600">Qty: {product.quantity} {product.unit}</span>
                            <span className="font-medium text-green-600">Rs. {product.price}/{product.unit}</span>
                            <span className="text-gray-600">{product.location}</span>
                            <span className="text-gray-600">{product.images.length} image{product.images.length === 1 ? '' : 's'}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editingProduct === product.id ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdateProduct(product.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incoming Orders</CardTitle>
            <CardDescription>Review buyer details, delivery address, and accept or reject each request.</CardDescription>
          </CardHeader>
          <CardContent>
            {myOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const buyer = users.find((entry) => entry.id === order.buyerId);
                  const buyerName = buyer?.name || order.buyerName;
                  return (
                    <div key={order.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold">{order.product.cropName}</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Order from: <span className="font-medium">{buyerName}</span>
                            </p>
                            <div className="mt-2 flex gap-4 text-sm">
                              <span>Quantity: {order.quantity} {order.product.unit}</span>
                              <span className="font-medium text-green-600">Total: Rs. {order.totalPrice.toLocaleString()}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{order.createdAt.toLocaleDateString()}</p>
                          </div>

                          <div className="grid gap-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{buyer?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{buyer?.phone || order.deliveryDetails.phone}</span>
                            </div>
                            <div className="md:col-span-2">
                              <p className="font-medium text-gray-900">Delivery Address</p>
                              <p>
                                {order.deliveryDetails.fullName}, {order.deliveryDetails.addressLine1}
                                {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ''},{' '}
                                {order.deliveryDetails.city}, {order.deliveryDetails.state} - {order.deliveryDetails.pincode}
                              </p>
                              {order.deliveryDetails.notes && <p className="mt-1 text-gray-500">Notes: {order.deliveryDetails.notes}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={order.status === 'accepted' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {order.status}
                          </Badge>
                          {order.status === 'pending' && (
                            <div className="ml-2 flex gap-2">
                              <Button size="sm" onClick={() => handleOrderAction(order.id, 'accepted')} className="bg-green-600 hover:bg-green-700">
                                <Check className="mr-1 h-4 w-4" />
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleOrderAction(order.id, 'rejected')}>
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
