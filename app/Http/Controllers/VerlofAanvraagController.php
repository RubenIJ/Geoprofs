<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VerlofAanvraag;

class VerlofAanvraagController extends Controller
{
    public function index()
    {
        $aanvragen = VerlofAanvraag::with(['medewerker', 'verlofreden', 'status'])->get();
        return view('verlofaanvragen.index', ['aanvragen' => $aanvragen]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medewerker_id' => 'required|exists:medewerkers,id',
            'verlofreden_id' => 'required|exists:verlofredenen,id',
            'startdatum' => 'required|date',
            'einddatum' => 'required|date|after_or_equal:startdatum',
        ]);

        $validated['status_id'] = 1;

        VerlofAanvraag::create($validated);

        return redirect()->route('verlofaanvragen.index');
    }

    public function goedkeuren(VerlofAanvraag $verlofaanvraag)
    {
        $medewerker = Medewerker::where('user_id', auth()->id())->first();

        if (!$medewerker || $medewerker->rol_id != 1) {
            abort(403, 'Alleen managers mogen aanvragen goedkeuren.');
        }

        $verlofaanvraag->update(['status_id' => 2]);

        return back();
    }

    public function afwijzen(VerlofAanvraag $verlofaanvraag)
    {
        $medewerker = Medewerker::where('user_id', auth()->id())->first();

        if (!$medewerker || $medewerker->rol_id != 1) {
            abort(403, 'Alleen managers mogen aanvragen afwijzen.');
        }

        $verlofaanvraag->update(['status_id' => 3]);

        return back();
    }
}
