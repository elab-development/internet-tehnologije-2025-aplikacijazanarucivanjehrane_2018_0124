<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Pregled korisnika (samo admin).
    public function index(Request $request)
    {
        $me = $request->user();

        if (!$me || $me->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Zabranjen pristup.',
            ], 403);
        }

        $users = User::query()
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista korisnika.',
            'data' => UserResource::collection($users),
        ], 200);
    }

    // Brisanje selektovanog korisnika (samo admin).
    public function destroy(Request $request, $id)
    {
        $me = $request->user();

        if (!$me || $me->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Zabranjen pristup.',
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Korisnik nije pronađen.',
            ], 404);
        }

        if ($user->id === $me->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ne možete obrisati sopstveni nalog.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Korisnik je obrisan.',
        ], 200);
    }
}
