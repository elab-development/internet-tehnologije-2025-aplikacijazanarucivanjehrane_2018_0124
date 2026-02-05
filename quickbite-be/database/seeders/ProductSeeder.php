<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shop;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Potaz dana',
                'image_url' => 'https://www.adresaukusa.rs/wp-content/uploads/2024/10/potaz-od-bundeve.jpg',
            ],
            [
                'name' => 'Cevapi sa kajmakom',
                'image_url' => 'https://cdn.navidiku.rs/firme/proizvodgalerija4/galerija44845/cevapi-sa-kajmakom-u-pivnici-zirafa-23-ec366f.jpg',
            ],
            [
                'name' => 'Zakuska za dvoje',
                'image_url' => 'https://media-cdn.tripadvisor.com/media/photo-s/12/95/51/c2/predjelo-prsut-sir-masline.jpg',
            ],
            [
                'name' => 'Teleca corba',
                'image_url' => 'https://ik.imagekit.io/misterd/tr:w-500,q-90/photo/_3evu1d28yen8fnq_1751642125915_Teleca%20corba%20(1).jpg',
            ],
            [
                'name' => 'Rolovano pilece belo',
                'image_url' => 'https://cdn.bestfood.rs/w/960/h/720/media/foods/Rolovano-pilece-belo-1.png',
            ],
            [
                'name' => 'Grilovane njoke sa curetinom',
                'image_url' => 'https://ik.imagekit.io/misterd/tr:w-500,q-90/photo/_y7jeir02ca744sc_1642849209391_njoke%20sa%20piletinom%20i%20pesto%20sosem.jpg',
            ],
            [
                'name' => 'Losos na zaru',
                'image_url' => 'https://images.24ur.com/media/images/953x459/May2011/60668380.jpg?v=ba85',
            ],
            [
                'name' => 'Dimljena pastrmka sa dalmatinskim varivom',
                'image_url' => 'https://ribnjak-raca.com/wp-content/uploads/2017/11/recept-pastrmka-3.jpg',
            ],
            [
                'name' => 'Ramstek taljata sa rukolom',
                'image_url' => 'https://www.volim-meso.hr/wordpress/wp-content/uploads/2015/06/tagliata-caponata-01.jpg',
            ],
            [
                'name' => 'Dimljena bela vesalica sa krompirom',
                'image_url' => 'https://www.kuvarancije.com/images/recepti/meso/svinjetina/2025/dimljena-vesalica-sa-kajmakom-6.JPG',
            ],
        ];

        $prices = [500, 1000, 1500, 2000, 2500, 3000];

        $shops = Shop::all();
        $total = 0;

        foreach ($shops as $shop) {
            // Za svaku prodavnicu biramo 2 razlicita indeksa (0-9) koja ce biti nedostupna.
            $indices = range(0, count($products) - 1);
            shuffle($indices);
            $unavailable = array_slice($indices, 0, 2); // 2 random proizvoda.

            foreach ($products as $i => $p) {
                $price = $prices[$i % count($prices)];
                $isAvailable = !in_array($i, $unavailable, true);

                Product::updateOrCreate(
                    ['shop_id' => $shop->id, 'name' => $p['name']],
                    [
                        'image_url' => $p['image_url'],
                        'price' => $price,
                        'is_available' => $isAvailable,
                    ]
                );

                $total++;
            }
        }

        $this->command->info("ProductSeeder: upisano/azurirano {$total} proizvoda.");
    }
}
