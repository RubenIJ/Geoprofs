<?php

namespace App\Http\Controllers;
use App\Models\Verlofreden;

use Illuminate\Http\Request;

class VerlofredenController extends Controller
{

    public function index()
    {
        $verlofredenen = Verlofreden::all();
        return view('verlofredenen.index', ['verlofredenen' => $verlofredenen]);
    }

    public function create()
    {
        return view('verlofredenen.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'beschrijving' => 'required|string|max:255',
        ]);

        Verlofreden::create($validated);

        return redirect()->route('verlofredenen.index');
    }

    public function show(string $id)
    {
        $verlofreden = Verlofreden::findOrFail($id);
        return view('verlofredenen.show', ['verlofreden' => $verlofreden]);
    }

    public function edit(string $id)
    {
        $verlofreden = Verlofreden::findOrFail($id);
        return view('verlofredenen.edit', ['verlofreden' => $verlofreden]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'beschrijving' => 'required|string|max:255',
        ]);

        $verlofreden = Verlofreden::findOrFail($id);
        $verlofreden->update($validated);

        return redirect()->route('verlofredenen.index');
    }

    public function destroy(string $id)
    {
        Verlofreden::findOrFail($id)->delete();

        return redirect()->route('verlofredenen.index');
    }
}
