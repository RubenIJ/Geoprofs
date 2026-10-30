<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Afdeling extends Model
{
    protected $table = 'afdelingen';
    public $timestamps = false;
    protected $fillable = ['naam'];
}
