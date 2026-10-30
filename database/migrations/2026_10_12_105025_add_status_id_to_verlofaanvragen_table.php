<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status', function (Blueprint $table) {
            $table->id();
            $table->string('naam');
        });

        DB::table('status')->insert([
            ['id' => 1, 'naam' => 'Afwachtend'],
            ['id' => 2, 'naam' => 'Goedgekeurd'],
            ['id' => 3, 'naam' => 'Afgewezen'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('status');
    }
};
