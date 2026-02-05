<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Shop;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        // Uzimamo sve shop vlasnike (mihailo + 3 iz factory).
        $shopOwners = User::where('role', 'shop')->orderBy('id')->get();

        // Ako neko slučajno nije seed-ovao shop korisnike, da ne puca tiho.
        if ($shopOwners->count() === 0) {
            $this->command->warn('Nema nijednog user-a sa role=shop. Pokreni prvo UserSeeder.');
            return;
        }

        // 8 prodavnica ukupno. (4 vlasnika * 2 prodavnice).
        // lat/lng su “razumni” i u okviru Beograda (kasnije lako zamenimo tačnim).
        $shops = [
            [
                'name' => 'Tri šešira',
                'address' => 'Skadarska 29, Beograd',
                'lat' => 44.81812,
                'lng' => 20.46475,
            ],
            [
                'name' => 'Lorenzo & Kakalamba',
                'address' => 'Cvijićeva 110, Beograd',
                'lat' => 44.80780,
                'lng' => 20.48890,
            ],
            [
                'name' => 'Restoran Franš',
                'address' => 'Bulevar oslobođenja 18A, Beograd',
                'lat' => 44.79490,
                'lng' => 20.46420,
            ],
            [
                'name' => 'Smokvica (Dorćol)',
                'address' => 'Gospodar Jovanova 45A, Beograd',
                'lat' => 44.82360,
                'lng' => 20.45490,
            ],
            [
                'name' => 'Comunale (Beton hala)',
                'address' => 'Karađorđeva 2–4, Beograd',
                'lat' => 44.81710,
                'lng' => 20.45170,
            ],
            [
                'name' => 'Salon 1905',
                'address' => 'Karađorđeva 48, Beograd',
                'lat' => 44.81160,
                'lng' => 20.45240,
            ],
            [
                'name' => 'Casa Nova',
                'address' => 'Gospodar Jovanova 42A, Beograd',
                'lat' => 44.82310,
                'lng' => 20.45570,
            ],
            [
                'name' => 'Homa Fine Dining',
                'address' => 'Žorža Klemansoa 19, Beograd',
                'lat' => 44.82390,
                'lng' => 20.46330,
            ],
        ];

        // Dodela: svaki shop owner dobija po 2 prodavnice redom.
        $index = 0;

        foreach ($shopOwners as $owner) {
            for ($i = 0; $i < 2; $i++) {
                if (!isset($shops[$index])) {
                    break;
                }

                Shop::create([
                    'user_id' => $owner->id,
                    'name' => $shops[$index]['name'],
                    'address' => $shops[$index]['address'],
                    'lat' => $shops[$index]['lat'],
                    'lng' => $shops[$index]['lng'],
                ]);

                $index++;
            }
        }

        $this->command->info("ShopSeeder: kreirano {$index} prodavnica.");
    }
}
