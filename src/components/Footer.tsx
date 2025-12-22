import Link from 'next/link';
import { Facebook, Disc, MessageCircle } from 'lucide-react'; // Using Disc for now, Telegram/Discord icons might differ. 
// Lucide has Facebook, Twitter, Instagram. It might not have Telegram/Discord perfectly in older versions, checking icons...
// Lucide usually has generic icons or brands. Next 13.5 usage.
// I'll used text if icons missing or generic 'MessageCircle' for Telegram.

const Footer = () => {
    return (
        <footer className="bg-black border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-white text-lg font-bold mb-4">Tiny Little Royale</h3>
                        <p className="text-gray-400 text-sm max-w-sm">
                            The ultimate multiplayer battle where chaos meets strategy! Jump into action-packed matches, pick your character, and unleash powerful weapons in a top-down shooter royale. Whether you prefer close-range combat or long-distance precision shots, every battle is an adrenaline rush!
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Social</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href={process.env.JOIN_DISCORD || "https://discord.gg/USUhhHVHt7"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 flex items-center gap-2 transition-colors">
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a href="https://facebook.com/tinylittleapp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 flex items-center gap-2 transition-colors">
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/tinylittlegame" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 flex items-center gap-2 transition-colors">
                                    Telegram
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Download</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="https://apps.apple.com/th/app/tiny-little-royale/id6743611360" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    iOS App Store
                                </a>
                            </li>
                            <li>
                                <a href="https://play.google.com/store/apps/details?id=com.hengtech.tinylittleroyale&hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                    Google Play
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Tiny Little Royale. All rights reserved.
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm">Privacy Policy</Link>
                        <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
