import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Package, ShoppingCart, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { users, products, orders, updateUserStatus } = useData();

  const farmers = users.filter((user) => user.role === 'farmer');
  const buyers = users.filter((user) => user.role === 'buyer');
  const activeUsers = users.filter((user) => user.active);
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const acceptedOrders = orders.filter((order) => order.status === 'accepted');
  const rejectedOrders = orders.filter((order) => order.status === 'rejected');

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUserStatus(userId, !currentStatus);
    toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">System overview and management.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="mt-1 text-xs text-gray-500">{activeUsers.length} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="mt-1 text-xs text-gray-500">Listed by {farmers.length} farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="mt-1 text-xs text-gray-500">{pendingOrders.length} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length > 0 ? Math.round((acceptedOrders.length / orders.length) * 100) : 0}%</div>
              <p className="mt-1 text-xs text-gray-500">{acceptedOrders.length} accepted orders</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter((user) => user.role !== 'admin')
                    .map((userData) => (
                      <div key={userData.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-semibold">{userData.companyName || userData.name}</h3>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                          <div className="mt-1 flex gap-2">
                            <Badge variant="outline" className="capitalize">
                              {userData.role}
                            </Badge>
                            <Badge variant="secondary">{userData.location}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {userData.active ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                          <Button
                            variant={userData.active ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => handleToggleUserStatus(userData.id, userData.active)}
                          >
                            {userData.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Listings</CardTitle>
                <CardDescription>All active farmer listings on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 rounded-lg border p-4">
                      <img src={product.image} alt={product.cropName} className="h-20 w-20 rounded object-cover" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.cropName}</h3>
                        <p className="text-sm text-gray-600">Farmer: {product.farmerName}</p>
                        <div className="mt-1 flex gap-4 text-sm">
                          <span className="text-gray-600">
                            {product.quantity} {product.unit}
                          </span>
                          <span className="font-medium text-green-600">
                            Rs. {product.price}/{product.unit}
                          </span>
                          <span className="text-gray-600">{product.location}</span>
                          <span className="text-gray-600">{product.images.length} image{product.images.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Monitor platform transactions and their current state.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <img src={order.product.image} alt={order.product.cropName} className="h-16 w-16 rounded object-cover" />
                          <div>
                            <h3 className="font-semibold">{order.product.cropName}</h3>
                            <p className="text-sm text-gray-600">
                              Buyer: {order.buyerName} to Farmer: {order.product.farmerName}
                            </p>
                            <div className="mt-1 flex gap-4 text-sm">
                              <span>
                                {order.quantity} {order.product.unit}
                              </span>
                              <span className="font-medium text-green-600">Rs. {order.totalPrice.toLocaleString()}</span>
                              <span className="text-gray-500">{order.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={order.status === 'accepted' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Management</CardTitle>
                <CardDescription>Handle platform disputes and issues.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-gray-500">
                  <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">No Active Disputes</p>
                  <p className="text-sm">All transactions are proceeding smoothly.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Farmers</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-green-600" style={{ width: `${(farmers.length / users.length) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right font-medium">{farmers.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Buyers</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${(buyers.length / users.length) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right font-medium">{buyers.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Admins</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: `${(1 / users.length) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right font-medium">1</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-600" style={{ width: orders.length > 0 ? `${(pendingOrders.length / orders.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-12 text-right font-medium">{pendingOrders.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Accepted</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-green-600" style={{ width: orders.length > 0 ? `${(acceptedOrders.length / orders.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-12 text-right font-medium">{acceptedOrders.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rejected</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-red-600" style={{ width: orders.length > 0 ? `${(rejectedOrders.length / orders.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-12 text-right font-medium">{rejectedOrders.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
