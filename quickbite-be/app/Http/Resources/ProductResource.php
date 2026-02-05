<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'shop_id' => $this->shop_id,
            'name' => $this->name,
            'image_url' => $this->image_url,
            'price' => (float) $this->price,
            'is_available' => (bool) $this->is_available,

            'shop' => new ShopResource($this->whenLoaded('shop')),
        ];
    }
}
