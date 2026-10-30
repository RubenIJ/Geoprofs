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
        Schema::create('statussen', function (Blueprint $table) {
            $table->id();
            $table->string('naam');
            $table->timestamps();
        });

        DB::table('statussen')->insert([
            ['naam' => 'Afwachtend'],   // 1
            ['naam' => 'Goedgekeurd'],  // 2
            ['naam' => 'Afgewezen'],    // 3
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statussen');
    }
};
