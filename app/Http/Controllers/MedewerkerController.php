<?php

namespace App\Http\Controllers;

use App\Models\Medewerker;
use Illuminate\Http\Request;

class MedewerkerController extends Controller
{
    public function index()
    {
        return view('medewerkers.index', ['medewerkers' => Medewerker::all()]);
    }

    public function create()
    {
        return view('medewerkers.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'afdeling_id' => 'required|exists:afdelingen,id',
            'rol_id' => 'required|exists:rollen,id',
            'voornaam' => 'required|string',
            'achternaam' => 'required|string',
            'email' => 'required|email',
        ]);

        Medewerker::create($validated);

        return redirect()->route('medewerkers.index');
    }

    public function show(Medewerker $medewerker)
    {
        return view('medewerkers.show', ['medewerker' => $medewerker]);
    }

    public function edit(Medewerker $medewerker)
    {
        return view('medewerkers.edit', ['medewerker' => $medewerker]);
    }

    public function update(Request $request, Medewerker $medewerker)
    {
        $validated = $request->validate([
            'afdeling_id' => 'required|exists:afdelingen,id',
            'rol_id' => 'required|exists:rollen,id',
            'voornaam' => 'required|string',
            'achternaam' => 'required|string',
            'email' => 'required|email',
        ]);

        $medewerker->update($validated);

        return redirect()->route('medewerkers.index');
    }

    public function destroy(Medewerker $medewerker)
    {
        $medewerker->delete();

        return redirect()->route('medewerkers.index');
    }
}
