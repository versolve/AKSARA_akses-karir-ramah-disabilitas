<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\Audit\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    /**
     * Tampilkan daftar kelola banner untuk admin.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $type = $request->input('type', 'all');
        $status = $request->input('status', 'all');

        $query = Banner::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('cta_text', 'like', "%{$search}%");
            });
        }

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $banners = $query->orderBy('order', 'asc')
            ->orderBy('id', 'asc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Banner::count(),
            'active' => Banner::where('is_active', true)->count(),
            'image_gif' => Banner::where('type', 'image')->count(),
            'interactive' => Banner::where('type', 'interactive')->count(),
            'info' => Banner::where('type', 'info')->count(),
        ];

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'status' => $status,
            ],
            'availableGradients' => [
                ['id' => 'blue', 'label' => 'Soft Blue (Bawaan)', 'class' => 'from-[#EBF5FA] via-[#E1EFF6] to-[#D5E9F4]'],
                ['id' => 'indigo', 'label' => 'Modern Indigo', 'class' => 'from-[#EEF2FF] via-[#E0E7FF] to-[#C7D2FE]'],
                ['id' => 'emerald', 'label' => 'Fresh Emerald', 'class' => 'from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0]'],
                ['id' => 'sunset', 'label' => 'Warm Sunset', 'class' => 'from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA]'],
                ['id' => 'purple', 'label' => 'Creative Purple', 'class' => 'from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]'],
                ['id' => 'dark', 'label' => 'Deep Navy Dark', 'class' => 'from-[#0B1E33] via-[#102B4B] to-[#1A3E66]'],
            ],
        ]);
    }

    /**
     * Simpan banner baru (mendukung upload gambar atau GIF animasi).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', 'in:interactive,image,info'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'], // Max 10MB (support GIF)
            'image_url' => ['nullable', 'url', 'max:1000'],
            'image_position' => ['nullable', 'string', 'max:50'],
            'image_scale' => ['nullable', 'integer', 'min:50', 'max:300'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'link_target' => ['nullable', 'string', 'in:_self,_blank'],
            'cta_text' => ['nullable', 'string', 'max:100'],
            'search_placeholder' => ['nullable', 'string', 'max:255'],
            'bg_gradient' => ['nullable', 'string', 'max:50'],
            'text_color' => ['nullable', 'string', 'in:dark,light'],
            'target_role' => ['nullable', 'string', 'in:pelamar,all,perusahaan'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image_path'] = $path;
        }

        // Tentukan order jika tidak diisi
        if (!isset($validated['order']) || $validated['order'] === null) {
            $maxOrder = Banner::max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['link_target'] = $validated['link_target'] ?? '_self';
        $validated['text_color'] = $validated['text_color'] ?? 'dark';
        $validated['bg_gradient'] = $validated['bg_gradient'] ?? 'blue';
        $validated['target_role'] = $validated['target_role'] ?? 'pelamar';

        $banner = Banner::create($validated);

        ActivityLogger::info(
            action: 'create',
            module: 'banner',
            description: "Admin menambahkan banner baru: \"{$banner->title}\" (Tipe: {$banner->type})",
            subject: $banner,
            extra: [
                'type' => $banner->type,
                'has_image' => (bool) $banner->image_path || (bool) $banner->image_url,
                'is_active' => $banner->is_active,
            ]
        );

        return back()->with('success', 'Banner berhasil ditambahkan ke carousel beranda.');
    }

    /**
     * Perbarui banner yang sudah ada.
     */
    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', 'in:interactive,image,info'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
            'image_url' => ['nullable', 'url', 'max:1000'],
            'image_position' => ['nullable', 'string', 'max:50'],
            'image_scale' => ['nullable', 'integer', 'min:50', 'max:300'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'link_target' => ['nullable', 'string', 'in:_self,_blank'],
            'cta_text' => ['nullable', 'string', 'max:100'],
            'search_placeholder' => ['nullable', 'string', 'max:255'],
            'bg_gradient' => ['nullable', 'string', 'max:50'],
            'text_color' => ['nullable', 'string', 'in:dark,light'],
            'target_role' => ['nullable', 'string', 'in:pelamar,all,perusahaan'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        // Hapus gambar jika diminta
        if ($request->boolean('remove_image')) {
            if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $validated['image_path'] = null;
        }

        // Simpan gambar baru jika diupload
        if ($request->hasFile('image')) {
            if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $path = $request->file('image')->store('banners', 'public');
            $validated['image_path'] = $path;
        }

        $validated['is_active'] = $request->boolean('is_active', $banner->is_active);
        $banner->update($validated);

        ActivityLogger::info(
            action: 'update',
            module: 'banner',
            description: "Admin memperbarui banner: \"{$banner->title}\"",
            subject: $banner
        );

        return back()->with('success', 'Perubahan banner berhasil disimpan.');
    }

    /**
     * Toggle status aktif/nonaktif banner.
     */
    public function toggle(Banner $banner): RedirectResponse
    {
        $banner->is_active = !$banner->is_active;
        $banner->save();

        $statusStr = $banner->is_active ? 'diaktifkan' : 'dinonaktifkan';

        ActivityLogger::info(
            action: 'toggle_status',
            module: 'banner',
            description: "Admin mengubah status banner \"{$banner->title}\" menjadi {$statusStr}.",
            subject: $banner
        );

        return back()->with('success', "Banner berhasil {$statusStr}.");
    }

    /**
     * Atur ulang urutan slide banner.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'integer', 'exists:banners,id'],
            'orders.*.order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->input('orders') as $item) {
            Banner::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Urutan slide banner berhasil diperbarui.');
    }

    /**
     * Hapus banner dan filenya.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        $title = $banner->title;

        if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        ActivityLogger::danger(
            action: 'delete',
            module: 'banner',
            description: "Admin menghapus banner: \"{$title}\"",
            extra: ['id' => $banner->id, 'title' => $title]
        );

        return back()->with('success', "Banner \"{$title}\" berhasil dihapus.");
    }
}
