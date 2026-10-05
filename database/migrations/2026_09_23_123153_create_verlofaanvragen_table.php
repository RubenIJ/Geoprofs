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
            $table->foreignId('medewerker_id')->constrained();
            $table->foreignId('verlofreden_id')->constrained('verlofredenen');
            $table->string('status')->default('aangevraagd');
            $table->foreignId('goedgekeurd_door')->nullable()->constrained('medewerkers');
            $table->date('beoordeeld_op')->nullable();
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
