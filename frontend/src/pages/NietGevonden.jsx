export default function Custom404() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-pink-500 selection:text-white">
            <div className="max-w-2xl w-full text-center space-y-6">

                {/* Grappige 404 Header */}
                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest text-pink-500 uppercase bg-pink-500/10 rounded-full border border-pink-500/20 animate-pulse">
                        Error 404: New Era Not Found
                    </span>
                    <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                        Oeps! Verdwaald?
                    </h1>
                    <p className="text-neutral-400 text-lg">
                        De pagina die je zoekt is naar een andere dimensie vertrokken.
                        Maar geen zorgen, we luisteren gewoon naar <span className="text-pink-400 font-semibold">KiiiKiii - 404 (New Era)</span> tot je weer de weg terugvindt! 🏴‍☠️✨
                    </p>
                </div>

                {/* YouTube Video Container */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/10 border border-neutral-800 bg-neutral-900">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/zhHB4dZTChw?autoplay=1&mute=0&controls=1"
                        title="KiiiKiii - 404 (New Era)"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Actie knop */}
                <div>
                    <a
                        href="/"
                        className="inline-block px-8 py-3 rounded-xl font-medium bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Terug naar Home 🚀
                    </a>
                </div>

            </div>
        </div>
    );
}