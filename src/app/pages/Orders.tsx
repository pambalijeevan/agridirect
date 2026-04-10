import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Package, Mail, Phone, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function Orders() {
  const { user } = useAuth();
  const { orders, products, users } = useData();

  const myOrders =
    user?.role === 'buyer'
      ? orders.filter((order) => order.buyerId === user?.id)
      : orders.filter((order) => products.some((product) => product.id === order.productId && product.farmerId === user?.id));

  const pendingOrders = myOrders.filter((order) => order.status === 'pending');
  const acceptedOrders = myOrders.filter((order) => order.status === 'accepted');
  const rejectedOrders = myOrders.filter((order) => order.status === 'rejected');

  const OrderCard = ({ order }: { order: (typeof myOrders)[number] }) => {
    const seller = users.find((entry) => entry.id === order.product.farmerId);
    const counterpart =
      user?.role === 'buyer'
        ? seller
        : users.find((entry) => entry.id === order.buyerId);
    const sellerName = seller?.name || order.product.farmerName;
    const buyerName = counterpart?.name || order.buyerName;

    return (
      <div className="rounded-lg border p-4 hover:bg-gray-50">
        <div className="flex items-start gap-4">
          <img src={order.product.image} alt={order.product.cropName} className="h-24 w-24 rounded object-cover" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{order.product.cropName}</h3>
                <p className="text-sm text-gray-600">
                  {user?.role === 'buyer' ? 'Farmer' : 'Buyer'}: {user?.role === 'buyer' ? sellerName : buyerName}
                </p>
                <p className="text-sm text-gray-600">Product Location: {order.product.location}</p>
              </div>
              <Badge variant={order.status === 'accepted' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">
                {order.status}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="text-gray-500">Quantity</span>
                <p className="font-medium">{order.quantity} {order.product.unit}</p>
              </div>
              <div>
                <span className="text-gray-500">Price per unit</span>
                <p className="font-medium">Rs. {order.product.price}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Amount</span>
                <p className="font-medium text-green-600">Rs. {order.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Order Date</span>
                <p className="font-medium">{order.createdAt.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{counterpart?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{counterpart?.phone || order.deliveryDetails.phone}</span>
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 flex items-center gap-2 font-medium text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Delivery Details
                </div>
                <p>
                  {order.deliveryDetails.fullName}, {order.deliveryDetails.addressLine1}
                  {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ''}, {order.deliveryDetails.city},{' '}
                  {order.deliveryDetails.state} - {order.deliveryDetails.pincode}
                </p>
                {order.deliveryDetails.notes && <p className="mt-1 text-gray-500">Notes: {order.deliveryDetails.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{user?.role === 'buyer' ? 'My Orders' : 'Incoming Orders'}</h1>
          <p className="mt-1 text-gray-600">
            {user?.role === 'buyer'
              ? 'Track order status, delivery details, and farmer contacts.'
              : 'Review buyer contacts, delivery address, and order decisions.'}
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Orders ({myOrders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedOrders.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Complete order history with contact and address details.</CardDescription>
              </CardHeader>
              <CardContent>
                {myOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p>No orders found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">{myOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders awaiting confirmation.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p>No pending orders.</p>
                  </div>
                ) : (
                  <div className="space-y-4">{pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accepted">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Orders</CardTitle>
                <CardDescription>Confirmed orders ready for delivery coordination.</CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p>No accepted orders.</p>
                  </div>
                ) : (
                  <div className="space-y-4">{acceptedOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Orders</CardTitle>
                <CardDescription>Requests that were declined.</CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p>No rejected orders.</p>
                  </div>
                ) : (
                  <div className="space-y-4">{rejectedOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
