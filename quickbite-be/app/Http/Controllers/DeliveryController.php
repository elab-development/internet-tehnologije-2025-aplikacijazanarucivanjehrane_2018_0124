<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    private function requireDelivery(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'delivery') {
            return response()->json([
                'success' => false,
                'message' => 'Zabranjen pristup.',
            ], 403);
        }

        return null;
    }

    // Pregled porudžbina spremnih za dostavu (ready_for_delivery).
    public function ready(Request $request)
    {
        if ($resp = $this->requireDelivery($request)) return $resp;

        $orders = Order::with(['shop']) // dovoljno za listu
            ->where('status', 'ready_for_delivery')
            ->whereNull('delivery_user_id')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Porudžbine spremne za dostavu.',
            'data' => OrderResource::collection($orders),
        ], 200);
    }

    // Preuzimanje porudžbine -> status delivering + dodela delivery_user_id.
    public function take(Request $request, $id)
    {
        if ($resp = $this->requireDelivery($request)) return $resp;

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije pronađena.',
            ], 404);
        }

        if ($order->status !== 'ready_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije spremna za preuzimanje.',
                'errors' => [
                    'status' => ['Dozvoljeno je preuzeti samo porudžbine u statusu ready_for_delivery.'],
                ],
            ], 422);
        }

        if ($order->delivery_user_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina je već preuzeta.',
            ], 409);
        }

        $order->update([
            'delivery_user_id' => $request->user()->id,
            'status' => 'delivering',
        ]);

        $order->load(['shop', 'buyer', 'delivery', 'items.product']);

        return response()->json([
            'success' => true,
            'message' => 'Porudžbina je preuzeta.',
            'data' => new OrderResource($order),
        ], 200);
    }

    // Promena statusa na delivered (samo dostavljač koji je preuzeo).
    public function delivered(Request $request, $id)
    {
        if ($resp = $this->requireDelivery($request)) return $resp;

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije pronađena.',
            ], 404);
        }

        if ($order->delivery_user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ne možete menjati ovu porudžbinu (nije dodeljena vama).',
            ], 403);
        }

        if ($order->status !== 'delivering') {
            return response()->json([
                'success' => false,
                'message' => 'Porudžbina nije u dostavi.',
                'errors' => [
                    'status' => ['Dozvoljeno je završiti samo porudžbine u statusu delivering.'],
                ],
            ], 422);
        }

        $order->update([
            'status' => 'delivered',
        ]);

        $order->load(['shop', 'buyer', 'delivery', 'items.product']);

        return response()->json([
            'success' => true,
            'message' => 'Porudžbina je označena kao delivered.',
            'data' => new OrderResource($order),
        ], 200);
    }
}
