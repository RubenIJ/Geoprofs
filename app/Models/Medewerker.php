<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medewerker extends Model
{
    protected $table = 'medewerkers';

    protected $fillable = [
        'afdeling_id', 'rol_id', 'user_id', 'bsn_nummer', 'voornaam', 'achternaam',
        'telefoonnummer', 'email', 'totaal_uren', 'gebruikte_uren', 'resterende_uren',
    ];

    public function afdeling(): BelongsTo
    {
        return $this->belongsTo(Afdeling::class, 'afdeling_id');
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function verlofaanvragen(): HasMany
    {
        return $this->hasMany(VerlofAanvraag::class, 'medewerker_id');
    }

    public function isManager(): bool
    {
        return $this->rol_id == 1;
    }
}
