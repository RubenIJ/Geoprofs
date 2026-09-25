// components/Header.jsx
export default function Header() {
    return (
        <header className="flex justify-between items-center bg-[#FF7A00] text-white w-full h-16 px-6 shadow-sm z-10 relative">
            <div className="flex items-center gap-3 text-2xl font-bold">
                <a href="/" className="flex items-center gap-2">

                    <span>GeoProfs</span>
                </a>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-white text-[#FF7A00] font-bold flex items-center justify-center text-sm">

                    </div>
                    <div className="text-sm text-left">
                        <p className="font-semibold leading-tight">Sophie</p>
                        <p className="text-xs text-white/80">Medewerker</p>
                    </div>
                </div>
            </div>
        </header>

    );
}