<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopOwnerController extends Controller
{
    //provera da li je korisnik vlasnik prodavnice - uloha
    private function requireShop(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'shop') {
            return response()->json([
                'success' => false,
                'message' => 'Zabranjen pristup.',
            ], 403);
        }

        return null;
    }

    //provera jel vlasnik specificnog restorana kojem hoce da pristupi
    private function ownerShopOrFail(Request $request, $shopId): ?Shop
    {
        return Shop::where('id', $shopId)
            ->where('user_id', $request->user()->id)
            ->first();
    }

    // Pregled svih proizvoda (za jednu prodavnicu).
    public function products(Request $request, $shopId)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shop = $this->ownerShopOrFail($request, $shopId);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena ili nije vaša.',
            ], 404);
        }

        $products = Product::where('shop_id', $shop->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Proizvodi za prodavnicu.',
            'data' => ProductResource::collection($products),
        ], 200);
    }

    //koji su retorani vlasnika
    public function myShops(Request $request)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shops = Shop::where('user_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Moje prodavnice.',
            'data' => \App\Http\Resources\ShopResource::collection($shops),
        ], 200);
    }

    // Kreiranje proizvoda (u okviru svoje prodavnice).
    public function createProduct(Request $request, $shopId)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shop = $this->ownerShopOrFail($request, $shopId);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena ili nije vaša.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $product = Product::create([
            'shop_id' => $shop->id,
            'name' => $validated['name'],
            'price' => $validated['price'],
            'image_url' => $validated['image_url'] ?? null, // samo paste URL
            'is_available' => $validated['is_available'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Proizvod je kreiran.',
            'data' => new ProductResource($product),
        ], 201);
    }

    // Izmena proizvoda (samo ako je proizvod u njegovoj prodavnici).
    public function updateProduct(Request $request, $shopId, $productId)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shop = $this->ownerShopOrFail($request, $shopId);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena ili nije vaša.',
            ], 404);
        }

        $product = Product::where('id', $productId)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Proizvod nije pronađen u vašoj prodavnici.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'is_available' => ['sometimes', 'boolean'],
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Proizvod je izmenjen.',
            'data' => new ProductResource($product),
        ], 200);
    }

    // Brisanje proizvoda (samo u njegovoj prodavnici).
    public function deleteProduct(Request $request, $shopId, $productId)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shop = $this->ownerShopOrFail($request, $shopId);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena ili nije vaša.',
            ], 404);
        }

        $product = Product::where('id', $productId)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Proizvod nije pronađen u vašoj prodavnici.',
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Proizvod je obrisan.',
        ], 200);
    }

    // Pregled porudžbina za prodavnicu.
    public function shopOrders(Request $request, $shopId)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shop = $this->ownerShopOrFail($request, $shopId);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena ili nije vaša.',
            ], 404);
        }

        $orders = Order::with(['buyer']) // dovoljno za listu
            ->where('shop_id', $shop->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Porudžbine za prodavnicu.',
            'data' => OrderResource::collection($orders),
        ], 200);
    }

    // Promena statusa porudžbine (accepted, cancelled, preparing, ready_for_delivery).
    public function updateOrderStatus(Request $request, $shopId, $orderId)
    {
        if ($resp = $this->requireShop($request)) return $resp;

        $shop = $this->ownerShopOrFail($request, $shopId);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Prodavnica nije pronađena ili nije vaša.',
            ], 404);
        }

        $order = Order::where('id', $orderId)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije pronađena u vašoj prodavnici.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:accepted,cancelled,preparing,ready_for_delivery'],
        ]);

        // Shop ne može da menja ako je već u dostavi ili završena.
        if (in_array($order->status, ['delivering', 'delivered'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Ne možete menjati porudžbinu koja je u dostavi ili završena.',
            ], 422);
        }

        $order->update([
            'status' => $validated['status'],
        ]);

        $order->load(['shop', 'buyer', 'delivery', 'items.product']);

        return response()->json([
            'success' => true,
            'message' => 'Status porudžbine je izmenjen.',
            'data' => new OrderResource($order),
        ], 200);
    }
}
