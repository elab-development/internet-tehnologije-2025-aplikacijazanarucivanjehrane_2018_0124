<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            //spoljni kljucevi, iz koje radnje, ko kupuje i ko dostavlja
             $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();

            $table->foreignId('buyer_user_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('delivery_user_id')
                ->nullable() //moze biti null na pocetku
                ->constrained('users')
                ->nullOnDelete();

            $table->string('status')->default('created');
            // created, accepted, preparing, ready_for_delivery, delivering, delivered, cancelled

            $table->string('delivery_address');
            $table->decimal('delivery_lat', 10, 7)->nullable();
            $table->decimal('delivery_lng', 10, 7)->nullable();

            $table->decimal('estimated_km', 10, 2)->nullable();
            $table->integer('estimated_min')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
