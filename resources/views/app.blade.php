<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? request()->cookie('appearance', 'light')) == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to apply theme preference from cookie/localStorage --}}
        <script>
            (function() {
                try {
                    const cookieMatch = document.cookie.match(/(?:^|; )appearance=([^;]*)/);
                    const cookieAppearance = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
                    const localAppearance = localStorage.getItem('appearance');
                    const appearance = cookieAppearance || localAppearance || '{{ $appearance ?? "light" }}';

                    if (appearance === 'dark') {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                    }
                } catch (e) {}
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
                overflow-y: scroll;
                scrollbar-gutter: stable;
            }

            html.dark {
                background-color: #020B3C;
            }
        </style>

        <link rel="icon" href="/images/logos/logo_profabel.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
