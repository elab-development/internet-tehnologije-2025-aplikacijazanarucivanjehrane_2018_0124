<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ShopOwnerController;
use App\Http\Controllers\BuyerController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    //delivery osoba
    Route::get('/delivery/orders/ready', [DeliveryController::class, 'ready']);          
    Route::post('/delivery/orders/{id}/take', [DeliveryController::class, 'take']);     
    Route::post('/delivery/orders/{id}/delivered', [DeliveryController::class, 'delivered']);

    //kupac
    Route::get('/shops', [BuyerController::class, 'shops']);                 
    Route::get('/shops/{id}', [BuyerController::class, 'shopMenu']);         

    Route::post('/orders', [BuyerController::class, 'createOrder']);         
    Route::get('/orders/my', [BuyerController::class, 'myOrders']);          
    Route::get('/orders/{id}', [BuyerController::class, 'orderDetails']);    
    Route::post('/orders/{id}/cancel', [BuyerController::class, 'cancelOrder']);

    //prodavnica
    Route::get('/shop/shops/{shopId}/products', [ShopOwnerController::class, 'products']); 
    Route::post('/shop/shops/{shopId}/products', [ShopOwnerController::class, 'createProduct']); 
    Route::put('/shop/shops/{shopId}/products/{productId}', [ShopOwnerController::class, 'updateProduct']); 
    Route::delete('/shop/shops/{shopId}/products/{productId}', [ShopOwnerController::class, 'deleteProduct']); 

    Route::get('/shop/shops/{shopId}/orders', [ShopOwnerController::class, 'shopOrders']); 
    Route::post('/shop/shops/{shopId}/orders/{orderId}/status', [ShopOwnerController::class, 'updateOrderStatus']);
});
