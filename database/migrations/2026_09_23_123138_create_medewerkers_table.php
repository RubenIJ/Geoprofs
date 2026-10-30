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
            $table->foreignId('rol_id')->constrained('rollen');
            $table->uuid('user_id')->nullable()->unique();
            $table->unsignedInteger('bsn_nummer');
            $table->string('voornaam');
            $table->string('achternaam');
            $table->string('telefoonnummer');
            $table->string('email')->unique();
            $table->integer('totaal_uren');
            $table->integer('gebruikte_uren')->default(0);
            $table->integer('resterende_uren');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medewerkers');
    }
};


