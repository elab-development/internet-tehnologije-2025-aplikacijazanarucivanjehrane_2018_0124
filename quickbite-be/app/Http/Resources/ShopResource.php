<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
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
            'name' => $this->name,
            'address' => $this->address,
            'lat' => (float) $this->lat,
            'lng' => (float) $this->lng,

            // Owner je koristan za admin/shop screens
            'owner' => new UserResource($this->whenLoaded('owner')),

            // Meni prodavnice.
            'products' => ProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
