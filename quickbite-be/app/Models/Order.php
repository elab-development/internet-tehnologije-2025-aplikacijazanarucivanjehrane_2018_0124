<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
    'shop_id',
    'buyer_user_id',
    'delivery_user_id',
    'status',
    'delivery_address',
    'delivery_lat',
    'delivery_lng',
    'estimated_km',
    'estimated_min',
];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_user_id');
    }

    public function delivery()
    {
        return $this->belongsTo(User::class, 'delivery_user_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
