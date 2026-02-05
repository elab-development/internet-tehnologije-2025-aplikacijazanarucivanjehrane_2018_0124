<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('quickbite');

        // Admin
        User::updateOrCreate(
            ['email' => 'admin@quickbite.test'],
            [
                'name' => 'admin',
                'password' => $password,
                'role' => 'admin',
            ]
        );

        // Delivery
        User::updateOrCreate(
            ['email' => 'aca@quickbite.test'],
            [
                'name' => 'Aca',
                'password' => $password,
                'role' => 'delivery',
            ]
        );

        // Shop (known)
        User::updateOrCreate(
            ['email' => 'mihailo@quickbite.test'],
            [
                'name' => 'Mihailo',
                'password' => $password,
                'role' => 'shop',
            ]
        );

        // Buyers (4)
        $buyers = [
            ['name' => 'Petar',  'email' => 'petar@quickbite.test'],
            ['name' => 'Jovana', 'email' => 'jovana@quickbite.test'],
            ['name' => 'Nikola', 'email' => 'nikola@quickbite.test'],
            ['name' => 'Milica', 'email' => 'milica@quickbite.test'],
        ];

        foreach ($buyers as $b) {
            User::updateOrCreate(
                ['email' => $b['email']],
                [
                    'name' => $b['name'],
                    'password' => $password,
                    'role' => 'buyer',
                ]
            );
        }

        // Extra 3 shop users via factory (random)
        User::factory()
            ->count(3)
            ->create([
                'role' => 'shop',
                'password' => $password,
            ]);
    }
}
