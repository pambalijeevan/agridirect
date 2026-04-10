import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Package, ShoppingCart, MessageSquare, Search, MapPin, Filter, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function BuyerDashboard() {
  const { user } = useAuth();
  const { products, orders, messages, notifications } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('none');

  const myOrders = orders.filter((order) => order.buyerId === user?.id);
  const myUnreadMessages = messages.filter((message) => message.receiverId === user?.id && !message.isRead).length;
  const myUnreadNotifications = notifications.filter((notification) => notification.userId === user?.id && !notification.read).length;
  const locations = Array.from(new Set(products.map((product) => product.location)));

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        product.cropName.toLowerCase().includes(term) ||
        product.location.toLowerCase().includes(term) ||
        product.farmerName.toLowerCase().includes(term);
      const matchesLocation = locationFilter === 'all' || product.location === locationFilter;
      return matchesSearch && matchesLocation;
    });

    if (priceSort === 'low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else {
      result = [...result].sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
    }

    return result;
  }, [locationFilter, priceSort, products, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {user?.companyName || user?.name}. Newly listed farmer products appear here automatically.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Farmer Listings</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <Link to="/orders" className="text-2xl font-bold text-blue-600 hover:underline">
                {myOrders.length}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <Link to="/messages" className="text-2xl font-bold text-blue-600 hover:underline">
                {myUnreadMessages}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myUnreadNotifications}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by crop, farmer, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceSort} onValueChange={setPriceSort}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Newest first</SelectItem>
                    <SelectItem value="low">Price: Low to High</SelectItem>
                    <SelectItem value="high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Available Products</h2>
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p>No farmer products match your search right now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.cropName}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{product.cropName}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {product.location}
                        </CardDescription>
                        <p className="mt-1 text-xs text-gray-500">{product.images.length} image{product.images.length === 1 ? '' : 's'} uploaded</p>
                      </div>
                      <Badge variant="secondary">
                        {product.quantity} {product.unit}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          Rs. {product.price}
                          <span className="text-sm text-gray-500">/{product.unit}</span>
                        </div>
                        <p className="text-xs text-gray-500">by {product.farmerName}</p>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track status changes and open the order details for delivery/contact information.</CardDescription>
              </div>
              <Link to="/orders">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {myOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p>No orders yet. Browse products and place your first order.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <img src={order.product.image} alt={order.product.cropName} className="h-16 w-16 rounded object-cover" />
                      <div>
                        <h3 className="font-semibold">{order.product.cropName}</h3>
                        <p className="text-sm text-gray-600">
                          {order.quantity} {order.product.unit} • Rs. {order.totalPrice.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{order.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={order.status === 'accepted' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
