<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('verlofsaldi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('medewerkers');
            $table->string('naam');
            $table->string('status');
            $table->date('datum');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verlofsaldi');
    }
};
