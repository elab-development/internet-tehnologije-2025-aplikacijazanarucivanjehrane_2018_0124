<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         return [
            'id' => $this->id,
            'status' => $this->status,

            'shop_id' => $this->shop_id,
            'buyer_user_id' => $this->buyer_user_id,
            'delivery_user_id' => $this->delivery_user_id,

            'delivery_address' => $this->delivery_address,
            'delivery_lat' => $this->delivery_lat !== null ? (float) $this->delivery_lat : null,
            'delivery_lng' => $this->delivery_lng !== null ? (float) $this->delivery_lng : null,

            'estimated_km' => $this->estimated_km !== null ? (float) $this->estimated_km : null,
            'estimated_min' => $this->estimated_min !== null ? (int) $this->estimated_min : null,

            // Nested samo kad controller eager-load.
            'shop' => new ShopResource($this->whenLoaded('shop')),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'delivery' => new UserResource($this->whenLoaded('delivery')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
