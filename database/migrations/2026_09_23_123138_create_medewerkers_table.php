<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('medewerkers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('afdeling_id')->constrained('afdelingen');
            $table->integer('bsn_nummer');
            $table->string('voornaam');
            $table->string('achternaam');
            $table->string('telefoonnummer');
            $table->string('functie');
            $table->string('rol')->default('medewerker');
            $table->integer('totaal_uren');
            $table->integer('gebruikte_uren');
            $table->integer('resterende_uren');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medewerkers');
    }
};
