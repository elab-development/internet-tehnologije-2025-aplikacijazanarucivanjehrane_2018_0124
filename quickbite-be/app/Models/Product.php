<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'shop_id', 
        'name', 
        'image_url',
        'price', 
        'is_available'
        ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

}
