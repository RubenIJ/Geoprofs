<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerlofAanvraag extends Model
{
    protected $table = 'verlofaanvragen';
    protected $fillable = ['medewerker_id', 'verlofreden_id', 'status_id', 'startdatum', 'einddatum'];

    public function medewerker(): BelongsTo
    {
        return $this->belongsTo(Medewerker::class, 'medewerker_id');
    }

    public function verlofreden(): BelongsTo
    {
        return $this->belongsTo(Verlofreden::class, 'verlofreden_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
}
