<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Verlofreden extends Model
{
    protected $table = 'verlofredenen';
    public $timestamps = false;
    protected $fillable = ['beschrijving'];
}
