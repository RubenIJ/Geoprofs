<?php

namespace Database\Seeders;

use App\Models\Gebruikers;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Gebruikers::factory(10)->create();

        Gebruikers::factory()->create([
            'name' => 'Test Gebruikers',
            'email' => 'test@example.com',
        ]);
    }
}
