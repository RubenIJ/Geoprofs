<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('verlofaanvragen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medewerker_id')->constrained('medewerkers');
            $table->foreignId('verlofreden_id')->constrained('verlofredenen');
            $table->foreignId('status_id')->default(1)->constrained('status');
            $table->date('startdatum');
            $table->date('einddatum');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verlofaanvragen');
    }
};
