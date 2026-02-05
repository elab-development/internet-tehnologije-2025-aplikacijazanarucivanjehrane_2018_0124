<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $buyers = User::where('role', 'buyer')->orderBy('id')->get();
        $delivery = User::where('role', 'delivery')->first();
        $shops = Shop::with('products')->get();

        if ($buyers->count() === 0) {
            $this->command->warn('Nema buyer korisnika. Pokreni prvo UserSeeder.');
            return;
        }

        if (!$delivery) {
            $this->command->warn('Nema delivery korisnika. Pokreni prvo UserSeeder.');
            return;
        }

        if ($shops->count() === 0) {
            $this->command->warn('Nema shop-ova. Pokreni prvo ShopSeeder.');
            return;
        }

        // Fiksna adresa po kupcu (uvek ista).
        // Koordinate su u okviru Beograda
        $buyerAddresses = [
            'petar@quickbite.test' => [
                'address' => 'Bulevar kralja Aleksandra 73, Beograd',
                'lat' => 44.80580,
                'lng' => 20.47500,
            ],
            'jovana@quickbite.test' => [
                'address' => 'Kneza Miloša 12, Beograd',
                'lat' => 44.80510,
                'lng' => 20.46520,
            ],
            'nikola@quickbite.test' => [
                'address' => 'Jurija Gagarina 14, Novi Beograd',
                'lat' => 44.80190,
                'lng' => 20.40090,
            ],
            'milica@quickbite.test' => [
                'address' => 'Bulevar despota Stefana 54, Beograd',
                'lat' => 44.81690,
                'lng' => 20.47240,
            ],
        ];

        DB::transaction(function () use ($buyers, $delivery, $shops, $buyerAddresses) {

            foreach ($buyers as $buyer) {
                $addr = $buyerAddresses[$buyer->email] ?? [
                    'address' => 'Beograd, Srbija',
                    'lat' => 44.78720,
                    'lng' => 20.45730,
                ];

                // 1) Završena porudžbina (delivered) sa dostavljačem.
                $this->createOrderWithItems(
                    buyer: $buyer,
                    shop: $shops->random(),
                    status: 'delivered',
                    deliveryUserId: $delivery->id,
                    deliveryAddress: $addr['address'],
                    deliveryLat: $addr['lat'],
                    deliveryLng: $addr['lng'],
                );

                // 2) Nova porudžbina (created) bez dostavljača.
                $this->createOrderWithItems(
                    buyer: $buyer,
                    shop: $shops->random(),
                    status: 'created',
                    deliveryUserId: null,
                    deliveryAddress: $addr['address'],
                    deliveryLat: $addr['lat'],
                    deliveryLng: $addr['lng'],
                );
            }
        });

        $this->command->info('OrderSeeder: kreirano 8 ordera (4 kupca × 2) i po 2 stavke u svakom.');
    }

    private function createOrderWithItems(
        User $buyer,
        Shop $shop,
        string $status,
        ?int $deliveryUserId,
        string $deliveryAddress,
        float $deliveryLat,
        float $deliveryLng,
    ): void {
        // Uzimamo 2 proizvoda iz te prodavnice
        // Preferiramo dostupne, ali ako nema dovoljno (npr. 2 su nedostupna), uzimamo bilo koja 2.
        $productsQuery = Product::where('shop_id', $shop->id)->where('is_available', true);
        $available = $productsQuery->inRandomOrder()->take(2)->get();

        if ($available->count() < 2) {
            $available = Product::where('shop_id', $shop->id)->inRandomOrder()->take(2)->get();
        }

        // Procene možemo jednostavno da “fejkujemo”
        $estimatedKm = rand(2, 15);      // 2–15 km.
        $estimatedMin = rand(10, 60);    // 10–60 min.

        $order = Order::create([
            'shop_id' => $shop->id,
            'buyer_user_id' => $buyer->id,
            'delivery_user_id' => $deliveryUserId,
            'status' => $status,

            'delivery_address' => $deliveryAddress,
            'delivery_lat' => $deliveryLat,
            'delivery_lng' => $deliveryLng,

            'estimated_km' => $estimatedKm,
            'estimated_min' => $estimatedMin,
        ]);

        foreach ($available as $product) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => rand(1, 3),
                'unit_price' => $product->price, // snapshot cene
            ]);
        }
    }
}
