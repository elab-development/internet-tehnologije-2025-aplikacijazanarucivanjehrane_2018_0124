<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Http\Resources\ShopResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BuyerController extends Controller
{

//pomocne metode za racunanje kilometraze - haversine metod jednacina
private function haversineKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon/2) * sin($dLon/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }

    //procena minuta
    private function estimateMinutes(float $km): int
    {
        $speedKmh = 25;     // prosečno gradski.
        $prepMin = 10;      // fiksno da restoranu treba 10 min
        $travelMin = ($km / $speedKmh) * 60;

        return (int) round($prepMin + $travelMin);
    }

    private function requireBuyer(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'buyer') {
            return response()->json([
                'success' => false,
                'message' => 'Zabranjen pristup.',
            ], 403);
        }

        return null;
    }

    // Pregled prodavnica + filtriranje.
    // Filteri: q (name/address)
    public function shops(Request $request)
    {
        if ($resp = $this->requireBuyer($request)) return $resp;

        $query = Shop::query();

        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('address', 'like', "%{$q}%");
            });
        }

        $shops = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista prodavnica.',
            'data' => ShopResource::collection($shops),
        ], 200);
    }

    // Pregled menija prodavnice (products po 1 prodavnici).
    public function shopMenu(Request $request, $id)
    {
        if ($resp = $this->requireBuyer($request)) return $resp;

        $shop = Shop::with('products')->find($id);

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Meni prodavnice.',
            'data' => new ShopResource($shop),
        ], 200);
    }

    // Kreiranje porudžbine.
   
    public function createOrder(Request $request)
    {
        if ($resp = $this->requireBuyer($request)) return $resp;

        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'delivery_address' => ['required', 'string', 'max:255'],
            'delivery_lat' => ['nullable', 'numeric'],
            'delivery_lng' => ['nullable', 'numeric'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $shop = Shop::find($validated['shop_id']);

        // Provera da svi proizvodi pripadaju toj prodavnici + da su dostupni.
        $productIds = collect($validated['items'])->pluck('product_id')->unique()->values();

        $products = Product::whereIn('id', $productIds)
            ->where('shop_id', $shop->id)
            ->get()
            ->keyBy('id');

        if ($products->count() !== $productIds->count()) {
            return response()->json([
                'success' => false,
                'message' => 'Neki proizvodi ne pripadaju izabranoj prodavnici.',
            ], 422);
        }

        foreach ($validated['items'] as $it) {
            $p = $products[$it['product_id']];
            if (!$p->is_available) {
                return response()->json([
                    'success' => false,
                    'message' => 'Neki proizvod nije dostupan.',
                    'errors' => [
                        'items' => ["Proizvod '{$p->name}' trenutno nije dostupan."],
                    ],
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($validated, $shop, $products, $request) {
            // Minimalna procena (dummy).
            $estimatedKm = null;
            $estimatedMin = null;

            if (!is_null($validated['delivery_lat'] ?? null) && !is_null($validated['delivery_lng'] ?? null)) {
                $km = $this->haversineKm((float)$shop->lat, (float)$shop->lng, (float)$validated['delivery_lat'], (float)$validated['delivery_lng']);
                $estimatedKm = round($km, 2);
                $estimatedMin = $this->estimateMinutes($estimatedKm);
                }

            $order = Order::create([
                'shop_id' => $shop->id,
                'buyer_user_id' => $request->user()->id,
                'delivery_user_id' => null,
                'status' => 'created',

                'delivery_address' => $validated['delivery_address'],
                'delivery_lat' => $validated['delivery_lat'] ?? null,
                'delivery_lng' => $validated['delivery_lng'] ?? null,

                'estimated_km' => $estimatedKm,
                'estimated_min' => $estimatedMin,
            ]);

            foreach ($validated['items'] as $it) {
                $p = $products[$it['product_id']];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $p->id,
                    'quantity' => $it['quantity'],
                    'unit_price' => $p->price, // snapshot.
                ]);
            }

            return $order;
        });

        $order->load(['shop', 'buyer', 'delivery', 'items.product']);

        return response()->json([
            'success' => true,
            'message' => 'Porudžbina je kreirana.',
            'data' => new OrderResource($order),
        ], 201);
    }

    // Pregled mojih porudžbina (list view - bez items).
    public function myOrders(Request $request)
    {
        if ($resp = $this->requireBuyer($request)) return $resp;

        $orders = Order::with('shop')
            ->where('buyer_user_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Moje porudžbine.',
            'data' => OrderResource::collection($orders),
        ], 200);
    }

    // Detalji jedne porudžbine (sa items + product).
    public function orderDetails(Request $request, $id)
    {
        if ($resp = $this->requireBuyer($request)) return $resp;

        $order = Order::with(['shop', 'buyer', 'delivery', 'items.product'])
            ->where('buyer_user_id', $request->user()->id)
            ->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije pronađena.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detalji porudžbine.',
            'data' => new OrderResource($order),
        ], 200);
    }

    // SKupac otkazuje porudžbinu.
    // Dozvoli otkaz samo dok nije u dostavi/završena.
    public function cancelOrder(Request $request, $id)
    {
        if ($resp = $this->requireBuyer($request)) return $resp;

        $order = Order::where('buyer_user_id', $request->user()->id)->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije pronađena.',
            ], 404);
        }

        $notAllowed = ['delivering', 'delivered', 'cancelled'];

        if (in_array($order->status, $notAllowed, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina se ne može otkazati u ovom statusu.',
                'errors' => [
                    'status' => ["Trenutni status je '{$order->status}'."],
                ],
            ], 422);
        }

        $order->update([
            'status' => 'cancelled',
        ]);

        $order->load(['shop', 'buyer', 'delivery', 'items.product']);

        return response()->json([
            'success' => true,
            'message' => 'Porudžbina je otkazana.',
            'data' => new OrderResource($order),
        ], 200);
    }
}
