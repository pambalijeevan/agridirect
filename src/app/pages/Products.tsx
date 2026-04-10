import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, MapPin, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function Products() {
  const { products } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('none');

  const locations = Array.from(new Set(products.map((product) => product.location)));

  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || product.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  if (priceSort === 'low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (priceSort === 'high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else {
    filteredProducts = [...filteredProducts].sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
          <p className="mt-1 text-gray-600">Showing only active farmer listings, with the newest products first.</p>
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
                    <SelectValue placeholder="Sort" />
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

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>No farmer-listed products match your filters.</p>
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
                  <div className="flex items-start justify-between gap-3">
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
    </div>
  );
}
