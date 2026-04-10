import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { MapPin, User, ArrowLeft, MessageSquare, ShoppingCart, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, placeOrder, sendMessage, users } = useData();
  const [orderQuantity, setOrderQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: user?.location || '',
    state: '',
    pincode: '',
    notes: '',
  });

  const product = products.find((entry) => entry.id === id);
  const farmer = useMemo(() => users.find((entry) => entry.id === product?.farmerId), [product?.farmerId, users]);
  const farmerName = farmer?.name || product?.farmerName || 'Unknown Farmer';

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p>Product not found.</p>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to place an order.');
      return;
    }

    const quantity = Number(orderQuantity);
    if (quantity <= 0 || quantity > product.quantity) {
      toast.error(`Enter a valid quantity between 1 and ${product.quantity}.`);
      return;
    }

    if (!deliveryDetails.fullName || !deliveryDetails.phone || !deliveryDetails.addressLine1 || !deliveryDetails.city || !deliveryDetails.state || !deliveryDetails.pincode) {
      toast.error('Please complete the delivery details.');
      return;
    }

    placeOrder({
      buyerId: user.id,
      buyerName: user.name,
      productId: product.id,
      product,
      quantity,
      totalPrice: quantity * product.price,
      status: 'pending',
      deliveryDetails,
    });

    toast.success('Order placed successfully. The farmer can now review your delivery details.');
    setIsOrderDialogOpen(false);
    setOrderQuantity('');
    navigate('/orders');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to send a message.');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    sendMessage({
      senderId: user.id,
      senderName: user.name,
      receiverId: product.farmerId,
      receiverName: farmerName,
      message: message.trim(),
    });

    toast.success('Message sent successfully.');
    setIsMessageDialogOpen(false);
    setMessage('');
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <img
              src={product.images[selectedImage] || product.image}
              alt={product.cropName}
              className="h-96 w-full rounded-lg object-cover shadow-lg"
            />
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border ${selectedImage === index ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200'}`}
                  >
                    <img src={image} alt={`${product.cropName} ${index + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.cropName}</h1>
                <div className="mt-2 flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
              </div>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                {product.quantity} {product.unit} available
              </Badge>
            </div>

            <div className="mb-6">
              <div className="mb-2 text-4xl font-bold text-green-600">
                Rs. {product.price}
                <span className="text-xl text-gray-500">/{product.unit}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Listed by <span className="font-medium">{farmerName}</span></span>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{product.description}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Both sides can see each other's contact information for smoother coordination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{farmerName}</span>
                </div>
                {farmer?.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>{farmer.companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{farmer?.email || 'Contact available after login'}</span>
                </div>
                {farmer?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{farmer.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Quantity:</span>
                  <span className="font-medium">{product.quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per unit:</span>
                  <span className="font-medium">Rs. {product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed on:</span>
                  <span className="font-medium">{product.listedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded Images:</span>
                  <span className="font-medium">{product.images.length}</span>
                </div>
              </CardContent>
            </Card>

            {user?.role === 'buyer' && (
              <div className="flex gap-4">
                <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 gap-2" size="lg">
                      <ShoppingCart className="h-5 w-5" />
                      Place Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Place Order</DialogTitle>
                      <DialogDescription>Add quantity and delivery details for the farmer.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity ({product.unit})</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder={`Max: ${product.quantity}`}
                          value={orderQuantity}
                          onChange={(e) => setOrderQuantity(e.target.value)}
                          min="1"
                          max={product.quantity}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Receiver Name</Label>
                          <Input
                            id="fullName"
                            value={deliveryDetails.fullName}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={deliveryDetails.phone}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address1">Address Line 1</Label>
                        <Input
                          id="address1"
                          value={deliveryDetails.addressLine1}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine1: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                          id="address2"
                          value={deliveryDetails.addressLine2}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine2: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={deliveryDetails.city}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={deliveryDetails.state}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={deliveryDetails.pincode}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Delivery Notes</Label>
                        <Textarea
                          id="notes"
                          value={deliveryDetails.notes}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, notes: e.target.value })}
                          placeholder="Loading instructions, preferred timings, landmark, etc."
                          rows={3}
                        />
                      </div>

                      {orderQuantity && Number(orderQuantity) > 0 && (
                        <div className="rounded-lg bg-gray-50 p-4">
                          <div className="mb-2 flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">{orderQuantity} {product.unit}</span>
                          </div>
                          <div className="mb-2 flex justify-between">
                            <span className="text-gray-600">Price per unit:</span>
                            <span className="font-medium">Rs. {product.price}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Total Amount:</span>
                            <span className="text-xl font-bold text-green-600">
                              Rs. {(Number(orderQuantity) * product.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Confirm Order</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" size="lg">
                      <MessageSquare className="h-5 w-5" />
                      Contact Farmer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Message to {farmerName}</DialogTitle>
                      <DialogDescription>Ask product questions or coordinate pricing and delivery.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Type your message here..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={5}
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Send Message</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {user?.role === 'farmer' && user.id === product.farmerId && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-blue-900">This listing is visible to buyers and companies, including the newest products you add.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
